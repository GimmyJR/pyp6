import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { commentSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get(
    '/:postId',
    zValidator('param', z.object({ postId: z.string().optional() })),
    async (c) => {
      const postId = c.req.param('postId');

      if (!postId) {
        return c.json(
          {
            success: false,
            message: 'Post ID is required',
          },
          400
        );
      }

      const comments = await db.comment.findMany({
        where: {
          postId,
        },
        include: {
          user: true,
        },
      });

      if (!comments.length) {
        return c.json({ message: 'No comments found', data: [] }, 200);
      }

      return c.json({ success: true, data: comments }, 200);
    }
  )
  .post(
    '/:postId',
    zValidator('param', z.object({ postId: z.string().optional() })),
    zValidator('json', commentSchema),
    async (c) => {
      const data = c.req.valid('json');
      const postId = c.req.param('postId');

      if (!postId) {
        return c.json(
          {
            success: false,
            message: 'Post ID is required',
          },
          400
        );
      }

      const user = await currentUser();

      if (!user || !user.id) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized!',
          },
          401
        );
      }

      const comment = await db.comment.create({
        data: {
          userId: user.id,
          content: data.comment,
          postId,
        },
      });

      return c.json(
        {
          success: true,
          data: comment,
        },
        201
      );
    }
  )
  .delete('/:id', async (c) => {
    const commentId = c.req.param('id');

    const user = await currentUser();

    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          message: 'Unauthorized!',
        },
        401
      );
    }

    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
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

    if (comment.userId !== user.id) {
      return c.json(
        {
          success: false,
          message: 'You are not authorized to delete this comment',
        },
        403
      );
    }

    await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return c.json(
      {
        success: true,
        message: 'Comment deleted successfully',
      },
      200
    );
  });

export default app;
