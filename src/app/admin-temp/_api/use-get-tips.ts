import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetTips = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GET_TIPS],
    queryFn: async () => {
      const response = await client.api.admin.tip.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch tips');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
