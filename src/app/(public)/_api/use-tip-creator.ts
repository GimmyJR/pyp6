import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<(typeof client.api.tip)[':id']['$post']>;
type RequestType = InferRequestType<
  (typeof client.api.tip)[':id']['$post']
>['json'];

export const useTipCreator = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.tip[':id']['$post']({
        json,
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to tip the creator');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
    onError: () => {
      toast.error('Failed to tip the creator!');
    },
  });

  return mutation;
};
