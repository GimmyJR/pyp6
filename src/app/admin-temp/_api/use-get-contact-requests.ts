import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetContactRequests = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GET_CONTACT_REQUESTS],
    queryFn: async () => {
      const response = await client.api.admin.contact.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch contact requests');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
