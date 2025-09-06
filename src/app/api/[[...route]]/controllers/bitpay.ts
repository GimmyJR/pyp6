import { currentUser } from '@/lib/auth';
import { bitpayClient } from '@/lib/bitpay';
import { db } from '@/lib/db';
import { convertAmountFromMiliunits } from '@/lib/utils';
import { zValidator } from '@hono/zod-validator';
import { Invoice } from 'bitpay-sdk/dist/Model';
import { Buyer } from 'bitpay-sdk/dist/Model/Invoice/Buyer';
import { Hono } from 'hono';
import { z } from 'zod';

// Schema for payment request
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
});

const app = new Hono().post(
  '/checkout',
  zValidator('json', createPaymentSchema),
  async (c) => {
    const { amount, description } = c.req.valid('json');
    const user = await currentUser();

    if (!user || !user.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const invoice = new Invoice(convertAmountFromMiliunits(amount), 'USD');
    invoice.orderId = `order-${Date.now()}`;
    invoice.notificationURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bitpay`;
    invoice.redirectURL = `${process.env.NEXT_PUBLIC_APP_URL}/billing`;
    invoice.posData = JSON.stringify({ userId: user.id });
    invoice.itemDesc = description || 'Deposit';
    invoice.transactionSpeed = 'medium';
    invoice.fullNotifications = true;

    const buyer = new Buyer();

    buyer.name = user.name || undefined;
    buyer.email = user.email || undefined;
    invoice.notificationEmail = user.email || undefined;

    buyer.notify = true;
    invoice.buyer = buyer;

    // Create the invoice in BitPay
    const createdInvoice = await bitpayClient.createInvoice(invoice);

    console.log({ url: createdInvoice.url });

    // Create a transaction record in the database
    const transaction = await db.transactions.create({
      data: {
        amount,
        description: description || 'BitPay Deposit',
        type: 'DEPOSIT',
        method: 'BTC',
        identifier: createdInvoice.id,
        status: 'PENDING',
        userId: user.id,
        metadata: {
          invoiceId: createdInvoice.id,
          invoiceUrl: createdInvoice.url,
          bitpayData: JSON.stringify(createdInvoice),
        },
      },
    });

    return c.json({
      success: true,
      paymentUrl: createdInvoice.url,
    });
  }
);

export default app;
