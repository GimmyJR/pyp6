import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetComments = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: [QUERY_KEYS.GET_COMMENTS_BY_POST, { id }],
    queryFn: async () => {
      const response = await client.api.comment[':postId']['$get']({
        param: { postId: id },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
