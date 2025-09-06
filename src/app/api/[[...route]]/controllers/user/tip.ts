import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return c.json({ message: 'Unauthorized' }, 400);
  }

  const tips = await db.tip.findMany({
    where: {
      OR: [
        {
          creatorId: user.id,
        },
        {
          userId: user.id,
        },
      ],
    },
    include: {
      creator: true,
      user: true,
      post: true,
    },
  });

  return c.json({ success: true, data: tips });
});

export default app;
