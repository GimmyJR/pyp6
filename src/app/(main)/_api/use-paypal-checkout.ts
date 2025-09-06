import { client } from '@/lib/hono';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Function to call the backend
const createCheckoutSession = async ({ amount }: { amount: number }) => {
  const response = await client.api.paypal.checkout.$post({ json: { amount } });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { approvalUrl } = await response.json();
  return approvalUrl;
};

// React Query Mutation Hook
export const usePaypalCheckoutMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: async (approvalUrl) => {
      if (approvalUrl) {
        router.push(approvalUrl);
      }
    },
    onError: (error) => {
      console.error('Payment failed:', error);
      alert('Payment failed');
    },
  });
};
