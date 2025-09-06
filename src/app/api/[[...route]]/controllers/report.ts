import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { reportSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono().post(
  '/:postId',
  zValidator('param', z.object({ postId: z.string().optional() })),
  zValidator('json', reportSchema),
  async (c) => {
    const data = c.req.valid('json');
    const { postId } = c.req.valid('param');

    if (!postId) {
      return c.json({
        message: 'PostId is missing!',
      });
    }

    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'You are not logged in!' }, 401);
    }

    const { faqs, ...restData } = data;

    const report = await db.reports.create({
      data: {
        userId: user.id,
        postId,
        ...restData,
        ...(faqs
          ? {
              faqs: {
                create: faqs.map((faq) => ({
                  question: faq.question,
                  answer: faq.answer,
                })),
              },
            }
          : {}),
      },
    });

    return c.json({ success: true, data: report });
  }
);

export default app;
