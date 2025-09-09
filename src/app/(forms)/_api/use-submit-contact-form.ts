import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.contact.$post>;
type RequestType = InferRequestType<typeof client.api.contact.$post>['json'];

export const useSubmitContactForm = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.contact.$post({ json });

      if (!response.ok) {
        throw new Error('Failed to submit the contact form');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Contact form submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit the contact form!');
    },
  });

  return mutation;
};
