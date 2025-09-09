import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Skip middleware for API routes to avoid issues
  if (nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // For now, allow all routes to pass through
  // Authentication will be handled at the component level
  // This avoids the openid-client middleware issues
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes to avoid conflicts)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
