import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import authConfig from '@/auth.config';
import { db } from '@/lib/db';
import { Gender, SexualOrientation, UserRole } from '@prisma/client';
import { getDeviceIpAddress, getUserById } from './data/user';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async session(props) {
      const session = props.session;
      if ('token' in props) {
        const token = props.token;

        if (token.sub && session.user) {
          session.user.id = token.sub;
        }

        if (token.role && session.user) {
          session.user.role = token.role as UserRole;
        }

        if (session.user) {
          session.user.name = token.name;
          session.user.email = token.email as string;
          session.user.username = token.username as string;
          session.user.image = token.image as string;
          session.user.role = token.role as UserRole;

          session.user.banned = token.banned as boolean;
          session.user.suspended = token.suspended as Date | null | undefined;

          session.user.location = token.location as string;
          session.user.gender = token.gender as Gender;
          session.user.sexualOrientation =
            token.sexualOrientation as SexualOrientation;

          session.user.ipAddress = token.ipAddress as string;
        }
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      const ipAddress = await getDeviceIpAddress();

      if (!existingUser) return token;

      token.name = existingUser.name;
      token.username = existingUser.username;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;

      token.banned = existingUser.banned;
      token.suspended = existingUser.suspended;

      token.gender = existingUser.gender;
      token.sexualOrientation = existingUser.sexualOrientation;
      token.location = existingUser.location;
      token.ipAddress = ipAddress;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  ...authConfig,
});
