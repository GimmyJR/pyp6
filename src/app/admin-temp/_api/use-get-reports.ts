import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetReports = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GET_REPORTS],
    queryFn: async () => {
      const response = await client.api.admin.reports.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
