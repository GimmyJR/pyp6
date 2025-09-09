import { hc } from 'hono/client';

import { AppType } from '@/app/api/[[...route]]/route';

const baseUrl = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_APP_URL ?? '' : '';

export const client = hc<AppType>(baseUrl, {
  fetch: (input, init) =>
    fetch(input as RequestInfo, { ...(init as RequestInit), credentials: 'include' }),
});
