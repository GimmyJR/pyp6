import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.user.payout)[':id']['$delete']
>;

export const useDeletePayoutMethod = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.user.payout[':id']['$delete']({
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payout method');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('payout method deleted Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PAYOUT_METHODS],
      });
    },
    onError: () => {
      toast.error('Failed to delete payout method!');
    },
  });

  return mutation;
};
