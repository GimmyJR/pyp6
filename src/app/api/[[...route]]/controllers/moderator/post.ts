import { db } from '@/lib/db';
import { managePostStatusSchema } from '@/schemas/moderator';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const unapprovedPosts = await db.post.findMany({
      where: {
        approvalStatus: { not: 'APPROVED' },
      },
      include: {
        creator: true,
      },
    });
    return c.json({ data: unapprovedPosts });
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
