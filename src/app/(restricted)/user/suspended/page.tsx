'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { format } from 'date-fns';
import Error from 'next/error';

export default function SuspendedPage() {
  const user = useCurrentUser();

  let title = 'You are Suspended from accessing this website';

  if (user && user.suspended) {
    const suspendedDate = format(new Date(user.suspended), 'dd MMMM, yyyy');

    title += ` until ${suspendedDate}`;
  }

  return <Error title={title} statusCode={403} />;
}
