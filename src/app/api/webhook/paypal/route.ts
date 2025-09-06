/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/db';
import paypal from '@paypal/checkout-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize PayPal SDK with your credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_ENVIRONMENT =
  process.env.PAYMENT_STATUS === 'LIVE'
    ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET
      );

// Create PayPal client
const paypalClient = new paypal.core.PayPalHttpClient(PAYPAL_ENVIRONMENT);

// WebHook verification endpoint
export async function POST(request: NextRequest) {
  let webhookLogId = null;
  const startTime = new Date();
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    // Get the raw request body for verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Extract headers for logging
    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    // Create initial webhook log entry
    webhookLogId = await createWebhookLog({
      provider: 'PAYPAL',
      eventType: payload.event_type || 'unknown',
      rawPayload: rawBody,
      ipAddress,
      headers: headersObj,
      success: false, // Initially false, will update later
      processedAt: startTime,
    });

    // Log the event for debugging
    console.log('PayPal webhook received:', {
      event_type: payload.event_type,
      resource_type: payload.resource_type,
      resource_id: payload.resource?.id,
    });

    // Verify webhook signature if webhook ID is provided
    if (PAYPAL_WEBHOOK_ID) {
      try {
        // For webhook verification, we need to use the REST API since the SDK doesn't
        // provide direct webhook verification functionality
        // First, we need to get an access token
        const request = new paypal.core.AccessTokenRequest(PAYPAL_ENVIRONMENT);
        const accessTokenResponse = await paypalClient.execute(request);
        const accessToken = accessTokenResponse.result.access_token;

        // Verify the webhook signature using direct fetch
        const verificationResponse = await fetch(
          `${
            process.env.PAYMENT_STATUS === 'LIVE'
              ? 'https://api-m.paypal.com'
              : 'https://api-m.sandbox.paypal.com'
          }/v1/notifications/verify-webhook-signature`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              webhook_id: PAYPAL_WEBHOOK_ID,
              webhook_event: payload,
              auth_algo: headersObj['paypal-auth-algo'] || '',
              cert_url: headersObj['paypal-cert-url'] || '',
              transmission_id: headersObj['paypal-transmission-id'] || '',
              transmission_sig: headersObj['paypal-transmission-sig'] || '',
              transmission_time: headersObj['paypal-transmission-time'] || '',
            }),
          }
        );

        const verificationData = await verificationResponse.json();

        if (
          !verificationResponse.ok ||
          verificationData.verification_status !== 'SUCCESS'
        ) {
          console.error(
            'PayPal webhook verification failed:',
            verificationData
          );
          await updateWebhookLog(webhookLogId, {
            success: false,
            errorDetails: `Webhook signature verification failed: ${JSON.stringify(verificationData)}`,
            responseCode: 400,
          });
          return NextResponse.json(
            {
              success: false,
              message: 'Webhook signature verification failed',
            },
            { status: 400 }
          );
        }
      } catch (verifyError) {
        console.error('PayPal webhook verification error:', verifyError);
        await updateWebhookLog(webhookLogId, {
          success: false,
          errorDetails:
            verifyError instanceof Error
              ? verifyError.message
              : 'Verification error',
          responseCode: 400,
        });
        return NextResponse.json(
          { success: false, message: 'Error verifying webhook signature' },
          { status: 400 }
        );
      }
    }

    // Process different event types
    let transactionId: string | null = null;

    switch (payload.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED':
        transactionId = await handlePaymentCompleted(payload);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        transactionId = await handlePaymentDenied(payload);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        transactionId = await handleRefund(payload);
        break;

      default:
        // Log unhandled event types
        console.log(`Unhandled PayPal event type: ${payload.event_type}`);
    }

    // Update webhook log with success and transaction ID if available
    await updateWebhookLog(webhookLogId, {
      success: true,
      transactionId: transactionId,
      responseCode: 200,
    });

    // Return 200 OK to acknowledge receipt of the webhook
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook processing error:', error);

    // Update webhook log with error details
    if (webhookLogId) {
      await updateWebhookLog(webhookLogId, {
        success: false,
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        responseCode: 500,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Helper function to create webhook log entry
async function createWebhookLog(data: {
  provider: string;
  eventType: string;
  rawPayload: string;
  ipAddress?: string;
  headers?: Record<string, string>;
  success: boolean;
  processedAt: Date;
  errorDetails?: string;
  transactionId?: string | null;
  responseCode?: number;
}) {
  const log = await db.webhookLogs.create({
    data: {
      provider: data.provider,
      eventType: data.eventType,
      rawPayload: data.rawPayload,
      ipAddress: data.ipAddress,
      headers: data.headers,
      success: data.success,
      processedAt: data.processedAt,
      errorDetails: data.errorDetails,
      transactionId: data.transactionId,
      responseCode: data.responseCode,
    },
  });

  return log.id;
}

// Helper function to update webhook log entry
async function updateWebhookLog(
  id: string,
  data: {
    success?: boolean;
    errorDetails?: string;
    transactionId?: string | null;
    responseCode?: number;
  }
) {
  await db.webhookLogs.update({
    where: { id },
    data,
  });
}

// Helper function to handle completed payments
async function handlePaymentCompleted(payload: any): Promise<string | null> {
  const orderId =
    payload.resource?.supplementary_data?.related_ids?.order_id ||
    payload.resource?.parent_payment ||
    payload.resource?.id;

  if (!orderId) {
    console.error('No order ID found in payload');
    return null;
  }

  // Find the transaction in your database
  const transaction = await db.transactions.findFirst({
    where: {
      identifier: orderId,
      method: 'PAYPAL',
    },
  });

  if (!transaction) {
    console.error(`Transaction not found for order ID: ${orderId}`);
    return null;
  }

  // Update the transaction status
  const dbTransaction = await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'COMPLETED',
      metadata: {
        ...(typeof transaction.metadata === 'object' &&
        transaction.metadata !== null
          ? transaction.metadata
          : {}),
        paypalStatus: 'COMPLETED',
        paypalEvent: payload.event_type,
        updatedAt: new Date().toISOString(),
        paymentId: payload.resource?.id,
        captureId: payload.resource?.id,
      },
    },
  });

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

  console.log(`Transaction ${transaction.id} marked as completed`);
  return transaction.id;
}

// Helper function to handle denied payments
async function handlePaymentDenied(payload: any): Promise<string | null> {
  const orderId =
    payload.resource?.supplementary_data?.related_ids?.order_id ||
    payload.resource?.parent_payment ||
    payload.resource?.id;

  if (!orderId) {
    console.error('No order ID found in payload');
    return null;
  }

  // Find the transaction in your database
  const transaction = await db.transactions.findFirst({
    where: {
      identifier: orderId,
      method: 'PAYPAL',
    },
  });

  if (!transaction) {
    console.error(`Transaction not found for order ID: ${orderId}`);
    return null;
  }

  // Update the transaction status
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'REJECTED',
      metadata: {
        ...(typeof transaction.metadata === 'object' &&
        transaction.metadata !== null
          ? transaction.metadata
          : {}),
        paypalStatus: 'FAILED',
        paypalEvent: payload.event_type,
        updatedAt: new Date().toISOString(),
        reason: payload.resource?.status_details?.reason || 'Payment denied',
      },
    },
  });

  console.log(`Transaction ${transaction.id} marked as failed`);
  return transaction.id;
}

// Helper function to handle refunds
async function handleRefund(payload: any): Promise<string | null> {
  const captureId = payload.resource?.links
    ?.find((link: any) => link.rel === 'up')
    ?.href?.split('/')
    .pop();

  if (!captureId) {
    console.error('No capture ID found in refund payload');
    return null;
  }

  // Find the transaction in your database by captureId
  const transaction = await db.transactions.findFirst({
    where: {
      metadata: {
        path: ['captureId'],
        equals: captureId,
      },
      method: 'PAYPAL',
    },
  });

  if (!transaction) {
    console.error(`Transaction not found for capture ID: ${captureId}`);
    return null;
  }

  // Calculate refunded amount
  const refundAmount = parseFloat(payload.resource?.amount?.value || '0');

  // Update the transaction status
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      status: 'COMPLETED',
      metadata: {
        ...(typeof transaction.metadata === 'object' &&
        transaction.metadata !== null
          ? transaction.metadata
          : {}),
        paypalStatus: 'REFUNDED',
        paypalEvent: payload.event_type,
        updatedAt: new Date().toISOString(),
        refundId: payload.resource?.id,
        refundAmount: refundAmount,
      },
    },
  });

  // Create a refund record
  const refundTransaction = await db.transactions.create({
    data: {
      userId: transaction.userId,
      amount: -Math.abs(transaction.amount), // Negative amount for refund
      type: 'REFUND',
      status: 'COMPLETED',
      method: 'PAYPAL',
      identifier: payload.resource?.id,
      description: `Refund for transaction ${transaction.identifier}`,
      metadata: {
        originalTransactionId: transaction.id,
        paypalRefundId: payload.resource?.id,
        refundAmount: refundAmount,
        currency: 'USD',
      },
    },
  });

  await db.user.update({
    where: {
      id: transaction.userId,
    },
    data: {
      balance: {
        decrement: transaction.amount,
      },
      totalSpent: {
        decrement: transaction.amount,
      },
    },
  });

  console.log(`Transaction ${transaction.id} marked as refunded`);
  return transaction.id;
}

export async function GET(req: NextRequest) {
  // PayPal may send verification requests to check endpoint availability
  return NextResponse.json({
    status: 'active',
    provider: 'PAYPAL',
    timestamp: new Date().toISOString(),
  });
}
