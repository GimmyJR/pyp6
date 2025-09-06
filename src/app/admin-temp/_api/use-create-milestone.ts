import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.admin.milestone.$post>;
type RequestType = InferRequestType<
  typeof client.api.admin.milestone.$post
>['json'];

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.milestone.$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to create the milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('milestone created Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_GET_MILESTONES],
      });
    },
    onError: () => {
      toast.error('Failed to create the milestone!');
    },
  });

  return mutation;
};
