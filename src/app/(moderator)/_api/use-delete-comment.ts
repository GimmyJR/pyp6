import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.post)[':id']['$delete']
>;

export const useDeleteComment = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.moderator.comment[':id']['$delete']({
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('comment deleted Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MODERATOR_GET_COMMENTS],
      });
    },
    onError: () => {
      toast.error('Failed to delete comment!');
    },
  });

  return mutation;
};
