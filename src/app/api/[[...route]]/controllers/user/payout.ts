import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Hono } from 'hono';

import { addPayoutMethodSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const payoutMethods = await db.payoutMethod.findMany({
      where: {
        userId: user.id,
      },
    });

    return c.json({ success: true, data: payoutMethods }, 200);
  })
  .post('/', zValidator('json', addPayoutMethodSchema), async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const data = c.req.valid('json');

    const existingPayoutMethods = await db.payoutMethod.findFirst({
      where: {
        userId: user.id,
        method: data.method,
      },
    });

    if (existingPayoutMethods) {
      return c.json({ message: 'Payout method already exists' }, 400);
    }

    const payoutMethod = await db.payoutMethod.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return c.json({ success: true, data: payoutMethod }, 201);
  })
  .patch(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', addPayoutMethodSchema),
    async (c) => {
      const user = await currentUser();

      if (!user || !user?.id) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ message: 'Missing id' }, 400);
      }

      const data = c.req.valid('json');

      const existingPayoutMethod = await db.payoutMethod.findUnique({
        where: {
          id,
        },
      });

      if (existingPayoutMethod?.userId != user.id) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      if (existingPayoutMethod.method !== data.method) {
        const existingPayoutMethods = await db.payoutMethod.findFirst({
          where: {
            userId: user.id,
            method: data.method,
          },
        });

        if (existingPayoutMethods) {
          return c.json({ message: 'Payout method already exists' }, 400);
        }
      }

      await db.payoutMethod.update({
        where: {
          id,
        },
        data: {
          ...data,
        },
      });

      return c.json({ success: true }, 200);
    }
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const user = await currentUser();
      const { id } = c.req.valid('param');

      if (!user || !user?.id) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      if (!id) {
        return c.json({ message: 'Missing id' }, 400);
      }

      const payoutMethod = await db.payoutMethod.findUnique({
        where: {
          id,
        },
      });

      if (payoutMethod?.userId !== user.id) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      await db.payoutMethod.delete({
        where: {
          id,
        },
      });

      return c.json({ success: true }, 200);
    }
  );

export default app;
