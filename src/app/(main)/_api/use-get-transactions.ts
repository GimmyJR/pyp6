import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetTransactions = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_TRANSACTION],
    queryFn: async () => {
      const response = await client.api.user.transaction.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
