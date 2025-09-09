import { hc } from 'hono/client';

import { AppType } from '@/app/api/[[...route]]/route';

// Prefer relative base in browser so cookies are sent and avoid 404s when env is missing
const baseUrl =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_APP_URL ?? ''
    : '';

export const client = hc<AppType>(baseUrl, {
  fetch: (input, init) => {
    return fetch(input as RequestInfo, {
      ...init,
      credentials: 'include',
    } as RequestInit);
  },
});
