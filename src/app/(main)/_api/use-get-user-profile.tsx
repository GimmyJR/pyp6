import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/query-keys';
import { client } from '@/lib/hono';
import { convertAmountFromMiliunits } from '@/lib/utils';

export const useGetUserProfile = () => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: async () => {
      const response = await client.api.user.profile.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const { data } = await response.json();

      if (!data) {
        return data;
      }

      return {
        ...data,
        balance: convertAmountFromMiliunits(data.balance ?? 0),
        totalSpent: convertAmountFromMiliunits(data.totalSpent ?? 0),
      };
    },
  });

  return query;
};
