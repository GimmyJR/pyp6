import { db } from '@/lib/db';

import { headers } from 'next/headers';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (err) {
    return null;
  }
};

export const getDeviceIpAddress = async () => {
  const requestHeaders = headers();

  try {
    const ipAddress = requestHeaders.get('x-forwarded-for') || 'unknown';

    return ipAddress;
  } catch (err) {
    return null;
  }
};
