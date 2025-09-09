// src/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getUserById } from "./data/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    username?: string | null;
  }

  interface JWT {
    id: string;
    role: UserRole;
    username?: string | null;
  }
}

const auth = NextAuth({
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
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
    async jwt({ token, user }) {
      // On first login, persist user.id and role into the token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? UserRole.USER;
        token.username = (user as any).username ?? null;
      }

      // On subsequent calls, ensure token data comes from DB
      if (token.id) {
        const existingUser = await getUserById(token.id);
        if (existingUser) {
          token.name = existingUser.name;
          token.email = existingUser.email;
          token.image = existingUser.image;
          token.username = existingUser.username;
          token.role = existingUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  ...authConfig,
});

export const { handlers, signIn, signOut } = auth;
export { auth };
