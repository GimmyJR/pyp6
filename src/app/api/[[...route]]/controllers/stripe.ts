import { currentUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const checkoutSchema = z.object({
  amount: z.number(),
});

const app = new Hono().post(
  '/checkout',
  zValidator('json', checkoutSchema),
  async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'You are not logged in!' }, 401);
    }

    const { amount } = await c.req.json();

    if (!amount) {
      return c.json({ message: 'Amount is required!' }, 400);
    }

    // Find or create a customer in Stripe
    let customer;

    try {
      // Try to find existing customer by email
      const customers = await stripe.customers.list({
        email: user.email as string,
        limit: 1,
      });

      if (customers.data.length > 0) {
        // Use existing customer
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: user.email as string,
          metadata: {
            userId: user.id as string,
          },
          name: user.name || undefined,
        });
      }
    } catch (error) {
      console.error('Error finding/creating Stripe customer:', error);
      return c.json({ message: 'Payment service error' }, 500);
    }

    // Create checkout session with the customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: customer.id, // Link to the customer
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Custom Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id as string,
        email: user.email as string,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return c.json({
      sessionId: session.id,
      url: session.url, // Return the session URL for redirect
    });
  }
);

export default app;
