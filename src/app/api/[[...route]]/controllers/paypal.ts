import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { convertAmountFromMiliunits } from '@/lib/utils';
import { zValidator } from '@hono/zod-validator';
import paypal from '@paypal/checkout-server-sdk';
import { Hono } from 'hono';
import { z } from 'zod';

// Initialize PayPal SDK with your credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_ENVIRONMENT =
  process.env.PAYMENT_STATUS === 'LIVE'
    ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(
        PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET
      );

// Create PayPal client
const paypalClient = new paypal.core.PayPalHttpClient(PAYPAL_ENVIRONMENT);

// Define Zod schema for checkout request
const checkoutSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
});

type CheckoutRequest = z.infer<typeof checkoutSchema>;

// Create Hono app
const app = new Hono()
  .get('/', (c) => {
    return c.json({ message: 'PayPal API endpoint' });
  })
  .post('/checkout', zValidator('json', checkoutSchema), async (c) => {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user || !user?.id) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    // Get validated request data
    const { amount, description } = c.req.valid('json');

    try {
      // Create a new order request
      const request = new paypal.orders.OrdersCreateRequest();

      // Set request headers
      request.headers['Prefer'] = 'return=representation';

      // Configure the order
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: convertAmountFromMiliunits(amount).toString(),
            },
            description: description || 'Account deposit',
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
          user_action: 'PAY_NOW',
        },
      });

      // Execute the request
      const orderResponse = await paypalClient.execute(request);
      const orderData = orderResponse.result;

      // Store the transaction information in the database
      const transaction = await db.transactions.create({
        data: {
          userId: user.id,
          amount: amount,
          type: 'DEPOSIT',
          status: 'PENDING',
          method: 'PAYPAL',
          identifier: orderData.id,
          description: description,
          metadata: {
            paypalOrderId: orderData.id,
            currency: 'USD',
          },
        },
      });

      // Find the approval URL from PayPal response
      const approvalLink = orderData.links.find(
        (link: { rel: string }) => link.rel === 'approve'
      );

      return c.json({
        success: true,
        approvalUrl: approvalLink.href,
      });
    } catch (error) {
      console.error('PayPal SDK error:', error);
      return c.json(
        { success: false, message: 'Failed to create PayPal order' },
        500
      );
    }
  });

export default app;
