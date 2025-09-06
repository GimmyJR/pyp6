import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) => {
  const user = await currentUser();

  if (!user || !user?.id) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const posts = await db.post.findMany({
    where: {
      creatorId: user.id,
    },
    include: {
      _count: {
        select: {
          vote: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!posts.length) {
    return c.json({ message: 'No posts found' }, 404);
  }

  return c.json({ success: true, data: posts }, 200);
});

export default app;
