import { db } from '@/lib/db';
import { Hono } from 'hono';

const app = new Hono().get('/applications', async (c) => {
  const applications = await db.moderatorApplication.findMany();
  return c.json({ data: applications });
});

export default app;
