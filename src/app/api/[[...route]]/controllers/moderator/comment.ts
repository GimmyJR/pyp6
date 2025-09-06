import { db } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const comments = await db.comment.findMany({
      include: {
        user: true,
        post: true,
      },
    });
    return c.json({ data: comments });
  })
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json(
          {
            success: false,
            message: 'Comment id is required',
          },
          400
        );
      }

      const comment = await db.comment.findUnique({
        where: {
          id,
        },
      });

      if (!comment) {
        return c.json(
          {
            success: false,
            message: 'Comment not found',
          },
          404
        );
      }

      await db.comment.delete({
        where: {
          id,
        },
      });

      return c.json(
        {
          success: true,
          message: 'Comment deleted successfully',
        },
        200
      );
    }
  );

export default app;
