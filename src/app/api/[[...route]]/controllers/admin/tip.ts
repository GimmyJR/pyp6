import { db } from '@/lib/db';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) => {
  const tips = await db.tip.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!tips.length) {
    return c.json({ message: 'No tips found' }, 404);
  }

  return c.json({ success: true, data: tips }, 200);
});

export default app;
