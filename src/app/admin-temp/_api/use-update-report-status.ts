import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.admin.reports)[':id']['updateStatus']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.reports)[':id']['updateStatus']['$patch']
>['json'];

export const useUpdateReportStatus = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.admin.reports[':id']['updateStatus'][
        '$patch'
      ]({
        json,
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('report status updated Successfully!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_GET_REPORTS],
      });
    },
    onError: () => {
      toast.error('Failed to update report status!');
    },
  });

  return mutation;
};
