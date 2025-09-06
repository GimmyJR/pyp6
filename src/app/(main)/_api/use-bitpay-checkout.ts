import { client } from '@/lib/hono';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Function to call the backend
const createCheckoutSession = async ({ amount }: { amount: number }) => {
  const response = await client.api.bitpay.checkout.$post({ json: { amount } });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { paymentUrl } = await response.json();
  return paymentUrl;
};

// React Query Mutation Hook
export const useBitpayCheckoutMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async (paymentUrl) => {
      if (paymentUrl) {
        router.push(paymentUrl);
      }
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      alert('Payment failed');
    },
  });
};
