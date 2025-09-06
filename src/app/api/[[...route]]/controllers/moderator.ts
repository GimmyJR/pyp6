import { db } from '@/lib/db';
import { ModeratorApplicationSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono().post(
  '/',
  zValidator('json', ModeratorApplicationSchema),
  async (c) => {
    const data = c.req.valid('json');

    const application = await db.moderatorApplication.create({
      data: {
        ...data,
        age: Number(data.age),
        dedicatedTimePerWeek: Number(data.dedicatedTimePerWeek),
      },
    });

    return c.json(
      {
        success: true,
        data: application,
      },
      201
    );
  }
);

export default app;
