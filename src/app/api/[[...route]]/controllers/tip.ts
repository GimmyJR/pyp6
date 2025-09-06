import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NotificationHandlers } from '@/lib/notifications/handlers';
import { tipSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono().post(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string().optional(),
    })
  ),
  zValidator('json', tipSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { amount } = c.req.valid('json');

    if (!id) {
      return c.json({ message: 'Post ID is required!' }, 400);
    }

    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'You are not logged in!' }, 401);
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, balance: true, sent_email_notifications: true },
    });

    if (!dbUser) {
      return c.json({ message: 'User not found!' }, 404);
    }

    if (dbUser.balance < amount) {
      return c.json({ message: 'Insufficient balance!' }, 402);
    }

    const post = await db.post.findUnique({
      where: { id },
      select: {
        id: true,
        creator: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      return c.json({ message: 'Post not found!' }, 404);
    }

    const creator = await db.user.findUnique({
      where: { id: post.creator.id },
      select: { id: true, balance: true, commissionPercent: true },
    });

    if (!creator) {
      return c.json({ message: 'Creator not found!' }, 404);
    }

    if (dbUser.id === creator.id) {
      return c.json({ message: 'You cannot tip yourself!' }, 403);
    }

    const tip = await db.tip.create({
      data: {
        amount,
        userId: user.id,
        postId: post.id,
        creatorId: creator.id,
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: {
        balance: dbUser.balance - amount,
      },
    });

    const creatorBalance = creator.balance + amount;

    await db.user.update({
      where: { id: creator.id },
      data: {
        balance: creatorBalance,
      },
    });

    if (dbUser.sent_email_notifications) {
      await NotificationHandlers.sendTipReceivedNotification(tip.id);
    }

    return c.json({ success: true }, 201);
  }
);

export default app;
