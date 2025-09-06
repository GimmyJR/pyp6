import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetPosts = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.MODERATOR_GET_POSTS],
    queryFn: async () => {
      const response = await client.api.moderator.post.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
