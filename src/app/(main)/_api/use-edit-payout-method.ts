import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.user.payout)[':id']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.user.payout)[':id']['$patch']
>['json'];

export const useEditPayoutMethod = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.payout[':id']['$patch']({
        json,
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to update the payout method');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PAYOUT_METHODS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PROFILE],
      });
      toast.success('payout method updated Successfully!');
    },
    onError: () => {
      toast.error('Failed to update the payout method!');
    },
  });

  return mutation;
};
