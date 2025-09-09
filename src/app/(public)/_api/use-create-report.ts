import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.report)[':postId']['$post']
>;
type RequestType = InferRequestType<
  (typeof client.api.report)[':postId']['$post']
>['json'];

export const useCreateReport = (postId?: string) => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.report[':postId']['$post']({
        json,
        param: { postId },
      });

      if (!response.ok) {
        throw new Error('Failed to submit the report');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('report submitted Successfully!');
    },
    onError: () => {
      toast.error('Failed to submit the report!');
    },
  });

  return mutation;
};
