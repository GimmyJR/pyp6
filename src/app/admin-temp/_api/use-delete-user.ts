import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.admin.user)[':id']['$delete']
>;

export const useDeleteUser = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.admin.user[':id']['$delete']({
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('user deleted Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_GET_USER, { id }],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GET_USERS] });
    },
    onError: () => {
      toast.error('Failed to delete user!');
    },
  });

  return mutation;
};
