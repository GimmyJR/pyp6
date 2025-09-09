/**
 * An array of routes that are publicly accessible
 * These routes will be accessible with / without authentication
 * @type {string[]}
 */
export const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/terms',
  '/become-a-moderator',
];

/**
 * An array of routes that are accessible only by banned people
 * These routes will be accessible with / without authentication
 * @type {string[]}
 */
export const bannedRoutes = ['/user/banned', '/user/suspended'];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in in users to the default redirect path
 * @type {string[]}
 */

export const authRoutes = ['/auth/sign-in', '/auth/sign-up'];

/**
 * An array of routes that are used for only by admins
 * These routes will redirect non-admin users to the default redirect path
 * @type {string[]}
 */

export const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/posts',
  '/admin/comments',
  '/admin/payouts',
  '/admin/logs',
];

/**
 * An array of routes that are used for only by moderators
 * These routes will redirect non-moderator users to the default redirect path
 * @type {string[]}
 */

export const moderatorRoutes = ['/moderator'];

/**
 * The prefix for API authentication routes
 * Routes start start with this prefix are used for API authentication process
 * @type {string}
 */

export const apiPrefix = '/api';

/**
 *  The default redirect path after a successful login
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = '/';

/**
 *  The default path for the sign in page
 * @type {string}
 */

export const DEFAULT_SIGN_IN_PATH = '/auth/sign-in';

/**
 *  Banned users will be redirected to this url by default
 * @type {string}
 */
export const DEFAULT_BANNED_USER_REDIRECT = '/user/banned';

/**
 *  Suspended users will be redirected to this url default
 * @type {string}
 */

export const DEFAULT_SUSPENDED_USER_REDIRECT = '/user/suspended';
