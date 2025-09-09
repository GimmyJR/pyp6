import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetUserPosts = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_POSTS],
    queryFn: async () => {
      const response = await client.api.user.post.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
