import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.admin.transaction.status)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.transaction.status)[':id']['$patch']
>['json'];

export const useEditTransactionStatus = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.transaction.status[':id'][
        '$patch'
      ]({
        json,
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to update the transaction status!');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('transaction status updated Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_GET_TRANSACTIONS],
      });
    },
    onError: () => {
      toast.error('Failed to update the transaction status!');
    },
  });

  return mutation;
};
