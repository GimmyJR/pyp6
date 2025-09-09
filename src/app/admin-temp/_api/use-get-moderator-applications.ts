import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';

export const useGetModeratorApplications = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GET_MODERATOR_APPLICATIONS],
    queryFn: async () => {
      const response = await client.api.admin.moderators.applications.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch moderator applications');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
