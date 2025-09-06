import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

export const useDeleteComment = (id?: string) => {
  const deleteComment = async () => {
    if (!id) throw new Error("ID is required");
    return client.api.post[":id"].$delete(id);
  };
  return { deleteComment };
};
