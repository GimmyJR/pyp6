import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.user.payout.$post>;
type RequestType = InferRequestType<
  typeof client.api.user.payout.$post
>['json'];

export const useCreatePayoutMethod = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.payout.$post({ json });

      if (!response.ok) {
        throw new Error('Failed to add the payout method');
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
      toast.success('payout method added Successfully!');
    },
    onError: () => {
      toast.error('Failed to add the payout method!');
    },
  });

  return mutation;
};
