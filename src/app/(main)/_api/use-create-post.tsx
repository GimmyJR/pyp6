import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';
import { toast } from 'sonner';

type ResponseType = InferResponseType<typeof client.api.post.$post>;
type RequestType = InferRequestType<typeof client.api.post.$post>['json'];

export const useCreatePost = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.post.$post({ json });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createPost: mutation.mutate,
    isPending: mutation.isPending,
  };
};
