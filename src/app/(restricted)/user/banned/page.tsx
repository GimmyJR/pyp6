'use client';

import Error from 'next/error';

export default function BannedPage() {
  return (
    <Error
      title='You are banned from accessing this website'
      statusCode={403}
    />
  );
}
