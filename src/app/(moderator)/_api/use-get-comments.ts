import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetComments = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.MODERATOR_GET_COMMENTS],
    queryFn: async () => {
      const response = await client.api.moderator.comment.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
