import { currentRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { Context, Next } from 'hono';

export const AuthorizeRole = (validRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const userRole = await currentRole();

    if (!userRole) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    if (validRoles.includes(userRole)) {
      return await next();
    }

    return c.json({ message: 'Forbidden' }, 403);
  };
};
