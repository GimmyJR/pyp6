import { db } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { ApprovalStatus } from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const contactRequests = await db.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return c.json({ data: contactRequests });
  })
  .patch(
    '/:id/updateStatus',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator('json', z.object({ status: z.nativeEnum(ApprovalStatus) })),
    async (c) => {
      const { id } = c.req.valid('param');
      const { status } = c.req.valid('json');

      if (!id) {
        return c.json({ message: 'ID is required' }, 400);
      }

      const contact = await db.contact.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      return c.json({ success: true, data: contact });
    }
  );

export default app;
