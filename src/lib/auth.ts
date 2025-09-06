import { auth } from '@/auth';
import { getToken as NextAuthGetToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET;

export const getToken = async (req: Request) => {
  const token = await NextAuthGetToken({ req, secret });
  return token;
};

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user.role;
};
