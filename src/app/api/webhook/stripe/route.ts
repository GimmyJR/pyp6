import { db } from '@/lib/db';
import { AvailablePayoutMethods, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export function GET() {
  return NextResponse.json({ message: 'Webhook endpoint active' });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await req.text(); // Stripe sends raw body, not JSON

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = err as Error;
    console.error('Webhook Error:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      // Add other event types as needed

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log('Payment Intent Success:', paymentIntent.id);

  // Get customer ID from the payment intent
  const stripeCustomerId = paymentIntent.customer as string;

  if (!stripeCustomerId) {
    console.error('No customer ID found in payment intent', paymentIntent.id);
    throw new Error('No customer ID found in payment intent');
  }

  // Retrieve customer from Stripe
  const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);

  if (stripeCustomer.deleted) {
    throw new Error('Stripe customer has been deleted');
  }

  // Store metadata for transaction record
  const metadata = paymentIntent.metadata || {};

  // Try to find user by ID in metadata first (most reliable)
  let user: User | null = null;

  if (metadata.userId) {
    user = await db.user.findUnique({
      where: { id: metadata.userId },
    });
  }

  // If not found by ID, try to find by email
  if (!user && stripeCustomer.email) {
    user = await db.user.findFirst({
      where: { email: stripeCustomer.email },
    });
  }

  // Last attempt: try receipt email from payment intent
  if (!user && paymentIntent.receipt_email) {
    user = await db.user.findFirst({
      where: { email: paymentIntent.receipt_email },
    });
  }

  if (!user) {
    console.error('User not found for payment', {
      stripeCustomerId,
      customerEmail: stripeCustomer.email,
      metadataUserId: metadata.userId,
    });
    throw new Error('User not found for payment');
  }

  // Process payment for the found user
  await processPayment(paymentIntent, user);
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  // Only process completed payments
  if (session.payment_status === 'paid') {
    const stripeCustomerId = session.customer as string;

    if (!stripeCustomerId) {
      console.error('No customer ID found in checkout session', session.id);
      throw new Error('No customer ID found in checkout session');
    }

    // Retrieve customer from Stripe
    const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);

    if (stripeCustomer.deleted) {
      throw new Error('Stripe customer has been deleted');
    }

    // Store metadata for transaction record
    const metadata = session.metadata || {};

    // Try to find user by ID in metadata first (most reliable)
    let user: User | null = null;

    if (metadata.userId) {
      user = await db.user.findUnique({
        where: { id: metadata.userId },
      });
    }

    // If not found by ID, try to find by email
    if (!user && stripeCustomer.email) {
      user = await db.user.findFirst({
        where: { email: stripeCustomer.email },
      });
    }

    // Last attempt: try customer email from session
    if (!user && session.customer_details?.email) {
      user = await db.user.findFirst({
        where: { email: session.customer_details.email },
      });
    }

    if (!user) {
      console.error('User not found for checkout session', {
        stripeCustomerId,
        customerEmail: stripeCustomer.email,
        metadataUserId: metadata.userId,
      });
      throw new Error('User not found for checkout session');
    }

    // Process checkout payment for the found user
    await processCheckoutPayment(session, user);
  }
}

async function processPayment(paymentIntent: Stripe.PaymentIntent, user: User) {
  // Calculate amount in miliunits
  const amountReceived = paymentIntent.amount_received;
  const amountReceivedInMiliunits = Math.floor(amountReceived * 10);

  // Create transaction record
  const transaction = await db.transactions.create({
    data: {
      amount: amountReceivedInMiliunits,
      userId: user.id,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      method: AvailablePayoutMethods.STRIPE,
      metadata: {
        paymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'unknown',
      },
    },
  });

  // Update user balance
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      balance: {
        increment: amountReceivedInMiliunits,
      },
      totalSpent: {
        increment: amountReceivedInMiliunits,
      },
    },
  });

  console.log(
    `Successfully processed payment for user ${user.id}, transaction ID: ${transaction.id}`
  );
}

async function processCheckoutPayment(
  session: Stripe.Checkout.Session,
  user: User
) {
  // Calculate amount in miliunits
  const amountTotal = session.amount_total || 0;
  const amountInMiliunits = Math.floor(amountTotal * 10);

  // Create transaction record
  const transaction = await db.transactions.create({
    data: {
      amount: amountInMiliunits,
      userId: user.id,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      method: AvailablePayoutMethods.STRIPE,
      metadata: {
        checkoutSessionId: session.id,
        stripeCustomerId: session.customer as string,
        paymentMethod: session.payment_method_types?.[0] || 'unknown',
      },
    },
  });

  // Update user balance
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      balance: {
        increment: amountInMiliunits,
      },
      totalSpent: {
        increment: amountInMiliunits,
      },
    },
  });

  console.log(
    `Successfully processed checkout for user ${user.id}, transaction ID: ${transaction.id}`
  );
}
