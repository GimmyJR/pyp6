import { bitpayClient } from '@/lib/bitpay';
import { db } from '@/lib/db';
import { convertAmountToMiliunits } from '@/lib/utils';
import { TransactionStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('BitPay webhook received');

  try {
    // Get raw request body
    const rawBody = await req.text();
    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON payload');
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Extract the data part of the payload
    const { data, event } = payload;

    if (!data || !data.id) {
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 }
      );
    }

    console.log(
      `Received BitPay webhook: ${event?.name || 'unknown'} for invoice ${data.id}`
    );

    // Retrieve the invoice from BitPay to verify authenticity and get current status
    const invoice = await bitpayClient.getInvoice(data.id);

    if (!invoice) {
      console.error(`Could not retrieve invoice from BitPay: ${data.id}`);
      return NextResponse.json(
        { error: 'Could not verify invoice with BitPay' },
        { status: 400 }
      );
    }

    // Verify that the status in the webhook matches the status from the API
    if (invoice.status !== 'confirmed' && data.status !== 'complete') {
      console.error(`Payment status is Pending`);
      return NextResponse.json(
        { error: 'Payment status is pending' },
        { status: 400 }
      );
    }

    // Find the transaction in our database
    const transaction = await db.transactions.findFirst({
      where: {
        identifier: invoice.id,
        method: 'BTC',
      },
    });

    if (!transaction) {
      console.error(`Transaction not found for BitPay invoice: ${invoice.id}`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify amount matches our records
    if (
      transaction.amount !== convertAmountToMiliunits(Number(invoice.price))
    ) {
      console.error(
        `Amount mismatch for invoice ${invoice.id}: expected ${transaction.amount}, got ${invoice.price}`
      );
      return NextResponse.json(
        { error: 'Amount verification failed' },
        { status: 400 }
      );
    }

    // Map BitPay status to our transaction status
    let status: TransactionStatus = 'PENDING';

    switch (invoice.status) {
      case 'complete':
      case 'confirmed':
      case 'paid':
        status = 'COMPLETED';
        break;
      case 'invalid':
      case 'expired':
        status = 'REJECTED';
        break;
      default:
        status = 'PENDING';
    }

    console.log(
      `Updating transaction ${transaction.id} status to ${status} (BitPay status: ${invoice.status})`
    );

    // Update transaction status in the database
    const dbTransaction = await db.transactions.update({
      where: { id: transaction.id },
      data: {
        status,
        metadata: {
          ...(typeof transaction.metadata === 'object' &&
          transaction.metadata !== null
            ? transaction.metadata
            : {}),
          bitpayData: JSON.stringify(invoice),
          lastUpdated: new Date().toISOString(),
          webhookReceived: true,
          eventName: event?.name || 'unknown',
          eventCode: event?.code,
          transactionCurrency: data.transactionCurrency,
          amountPaid: data.amountPaid,
        },
      },
    });

    if (status === 'COMPLETED') {
      await db.user.update({
        where: {
          id: dbTransaction.userId,
        },
        data: {
          balance: {
            increment: dbTransaction.amount,
          },
          totalSpent: {
            increment: dbTransaction.amount,
          },
        },
      });
    }

    // Store webhook receipt for audit purposes
    await db.webhookLogs.create({
      data: {
        provider: 'BITPAY',
        eventType: event?.name || 'unknown',
        transactionId: transaction.id,
        rawPayload: rawBody,
        processedAt: new Date(),
        success: true,
      },
    });

    // Return a success response to BitPay
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing BitPay webhook:', error);

    // Log the error in database for debugging
    try {
      await db.webhookLogs.create({
        data: {
          provider: 'BITPAY',
          eventType: 'error',
          rawPayload: JSON.stringify(error),
          processedAt: new Date(),
          success: false,
          errorDetails: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Failed to process BitPay notification',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Add GET handler for BitPay's verification requests
export async function GET(req: NextRequest) {
  // BitPay may send verification requests to check endpoint availability
  return NextResponse.json({
    status: 'active',
    provider: 'BitPay',
    timestamp: new Date().toISOString(),
  });
}
