import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetUser = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: [QUERY_KEYS.ADMIN_GET_USER, { id }],
    queryFn: async () => {
      const response = await client.api.admin.user[':id']['$get']({
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
