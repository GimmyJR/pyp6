// src/lib/auth.ts
import { auth } from '@/auth';
import { getToken as NextAuthGetToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

const secret = process.env.AUTH_SECRET;

export const getToken = async (req: NextRequest) => {
  const session = await auth();
  return session;
};

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user.role;
};
