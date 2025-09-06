import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Hono } from 'hono';

const app = new Hono()
  .get('/', (c) => {
    return c.json({ message: 'Hello World!' });
  })
  .post('/', async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'You are not logged in!' });
    }

    return c.json({ message: `Hello ${user?.name}!` });

    db.user.findUnique({
      where: {
        id: user?.id,
      },
    });
  });

export default app;
