import { db } from '@/lib/db';
import { NotificationHandlers } from '@/lib/notifications/handlers';
import { managePostStatusSchema } from '@/schemas/admin';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const posts = await db.post.findMany({
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return c.json({ data: posts });
  })
  .patch(
    '/:id',
    zValidator('json', managePostStatusSchema),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');

      if (!id) {
        return c.json(
          {
            success: false,
            message: 'Post id is required',
          },
          400
        );
      }

      const post = await db.post.findUnique({
        where: {
          id,
        },
        include: {
          creator: true,
        },
      });

      if (!post) {
        return c.json(
          {
            success: false,
            message: 'Post not found',
          },
          404
        );
      }

      await db.post.update({
        where: {
          id,
        },
        data,
      });

      if (post.creator.sent_email_notifications) {
        await NotificationHandlers.sendPostStatusNotification(post.id);
      }

      return c.json(
        {
          success: true,
          message: 'Post Updated successfully',
        },
        200
      );
    }
  );

export default app;
