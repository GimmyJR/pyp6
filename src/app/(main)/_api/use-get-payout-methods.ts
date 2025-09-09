import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetPayoutMethods = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_PAYOUT_METHODS],
    queryFn: async () => {
      const response = await client.api.user.payout.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch payout methods');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
