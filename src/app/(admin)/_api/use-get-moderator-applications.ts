import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

export const useGetModeratorApplications = (id?: string) => {
  const getApplications = async () => {
    if (!id) throw new Error("ID is required");
    return client.api.post[":id"].$delete(id);
  };
  return { getApplications };
};
