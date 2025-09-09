import { client } from '@/lib/hono';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Function to call the backend
const createCheckoutSession = async ({ amount }: { amount: number }) => {
  const response = await client.api.stripe.checkout.$post({ json: { amount } });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
};

// React Query Mutation Hook
export const useStripeCheckoutMutation = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async (sessionId) => {
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      alert('Payment failed');
    },
  });
};
