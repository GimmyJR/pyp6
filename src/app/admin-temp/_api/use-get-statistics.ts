import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetStatistics = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GET_STATISTICS],
    queryFn: async () => {
      const response = await client.api.admin.statistics.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
