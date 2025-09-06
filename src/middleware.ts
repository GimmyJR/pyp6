import NextAuth from 'next-auth';

import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

import {
  adminRoutes,
  apiPrefix,
  authRoutes,
  bannedRoutes,
  DEFAULT_BANNED_USER_REDIRECT,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_SUSPENDED_USER_REDIRECT,
  moderatorRoutes,
  publicRoutes,
} from '@/routes';
import { UserRole } from '@prisma/client';
import { currentUser } from './lib/auth';

export default auth(async (req) => {
  const { nextUrl } = req;

  // Skip middleware for API auth routes to avoid CSRF issues
  if (nextUrl.pathname.startsWith('/api/auth')) {
    return;
  }

  const user = await currentUser();

  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith(apiPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoutes.includes(nextUrl.pathname);
  const isModeratorRoute = moderatorRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isBannedRoute = bannedRoutes.includes(nextUrl.pathname);

  if (user) {
    const { banned, suspended } = user;

    if (isBannedRoute) {
      // Redirect if the user is not banned or the suspension has expired
      if (!banned && (!suspended || new Date(suspended) < new Date())) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }
    } else {
      // Redirect if the user is banned
      if (banned) {
        return Response.redirect(
          new URL(DEFAULT_BANNED_USER_REDIRECT, nextUrl)
        );
      }

      // Redirect if the user is suspended and the suspension is still active
      if (suspended && new Date(suspended) >= new Date()) {
        return Response.redirect(
          new URL(DEFAULT_SUSPENDED_USER_REDIRECT, nextUrl)
        );
      }
    }
  }

  if (isApiRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;

    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  if (isAdminRoute && user?.role !== UserRole.ADMIN) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  if (isModeratorRoute && user?.role !== UserRole.MODERATOR) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  return;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|api/auth).*)', '/', '/(api|trpc)(.*)'],
};
