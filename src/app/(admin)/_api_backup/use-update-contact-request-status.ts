import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

export const useUpdateContactRequestStatus = (id?: string) => {
  const updateStatus = async () => {
    if (!id) throw new Error("ID is required");
    return client.api.post[":id"].$delete(id);
  };
  return { updateStatus };
};
