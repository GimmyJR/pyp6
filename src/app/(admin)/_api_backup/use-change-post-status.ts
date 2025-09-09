import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

export const useChangePostStatus = (id?: string) => {
  const changeStatus = async () => {
    if (!id) throw new Error("ID is required");
    return client.api.post[":id"].$delete(id);
  };
  return { changeStatus };
};
