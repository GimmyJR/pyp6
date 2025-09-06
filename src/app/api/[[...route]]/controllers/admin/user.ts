import { db } from '@/lib/db';
import { adminUpdateUserSchema } from '@/schemas/admin';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const users = await db.user.findMany();

    return c.json({ data: users });
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id!' }, 400);
      }

      const user = await db.user.findUnique({
        where: {
          id,
        },
      });

      return c.json({ data: user });
    }
  )
  .patch(
    '/:id',
    zValidator('json', adminUpdateUserSchema),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const data = c.req.valid('json');
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing userId!' }, 400);
      }

      const user = await db.user.update({
        where: {
          id,
        },
        data,
      });

      return c.json({ data: user });
    }
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing userId!' }, 400);
      }

      await db.user.delete({
        where: {
          id,
        },
      });

      return c.json({ success: true });
    }
  );

export default app;
