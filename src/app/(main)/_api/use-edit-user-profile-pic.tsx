import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<
  (typeof client.api.user.profile.pic)['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.user.profile.pic)['$patch']
>['json'];

export const useEditUserProfilePic = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.profile.pic['$patch']({
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to update the profile pic');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
      toast.success('profile updated Successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile!');
    },
  });

  return mutation;
};
