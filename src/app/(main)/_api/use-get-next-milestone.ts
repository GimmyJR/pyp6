import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetNextMilestone = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_GET_NEXT_MILESTONE],
    queryFn: async () => {
      const response = await client.api.user.milestone.next.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch next milestone');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
