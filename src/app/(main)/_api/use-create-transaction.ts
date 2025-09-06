import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constants/query-keys';

type ResponseType = InferResponseType<typeof client.api.user.transaction.$post>;
type RequestType = InferRequestType<
  typeof client.api.user.transaction.$post
>['json'];

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.transaction.$post({ json });

      if (!response.ok) {
        throw new Error('Failed to make the transaction');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_TRANSACTION] });
    },
    onError: () => {
      toast.error('Failed to make the transaction!');
    },
  });

  return mutation;
};
