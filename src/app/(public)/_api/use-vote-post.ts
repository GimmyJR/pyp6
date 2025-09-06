import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type ResponseType = InferResponseType<(typeof client.api.vote)[':id']['$post']>;
type RequestType = InferRequestType<
  (typeof client.api.vote)[':id']['$post']
>['json'];

export const useVotePost = (id?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.vote[':id']['$post']({
        json,
        param: { id },
      });

      if (!response.ok) {
        // Get the response data to include in error
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to submit the vote') as Error & {
          statusCode?: number;
          responseData?: Record<string, unknown>;
        };
        error.statusCode = response.status;
        error.responseData = errorData;
        throw error;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.POST, { id }],
      });
      toast.success('Post voted successfully!');
    },
    onError: (error: Error) => {
      // Cast error to our extended type
      const customError = error as Error & {
        statusCode?: number;
        responseData?: {
          redirectToSignIn?: boolean;
          redirectUrl?: string;
          message?: string;
        };
      };
      
      // Check if we need to redirect to sign-in
      if (customError.statusCode === 403 && customError.responseData?.redirectToSignIn) {
        toast.error('Daily vote limit reached. Please sign in to continue voting.');
        router.push(customError.responseData.redirectUrl || '/auth/sign-in');
      } else {
        // For other errors, just show the message
        toast.error(customError.message || 'Failed to vote on the post');
      }
    },
  });

  return mutation;
};
