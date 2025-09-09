import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.moderator.$post>;
type RequestType = InferRequestType<typeof client.api.moderator.$post>['json'];

export const useSubmitModerateApplication = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.moderator.$post({ json });

      if (!response.ok) {
        throw new Error('Failed to submit the moderator application');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Moderator Application submitted Successfully!');
    },
    onError: () => {
      toast.error('Failed to submit the moderator application!');
    },
  });

  return mutation;
};
