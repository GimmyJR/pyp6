import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetMilestones = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_GET_MILESTONES],
    queryFn: async () => {
      const response = await client.api.user.milestone.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
