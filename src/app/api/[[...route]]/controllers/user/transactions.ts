import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
  .get('/', async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const transactions = await db.transactions.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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

    if (!transactions.length) {
      return c.json({ message: 'No transactions found' }, 404);
    }

    return c.json({ success: true, data: transactions }, 200);
  })
  .post('/', zValidator('json', transactionSchema), async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const dbUser = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      return c.json({ message: 'User not found' }, 404);
    }

    const data = c.req.valid('json');

    if (data.type === 'WITHDRAWAL') {
      const userMethod = await db.payoutMethod.findFirst({
        where: {
          userId: user.id,
          method: data.method,
        },
      });

      if (!userMethod) {
        return c.json({ message: 'Payout method not found' }, 404);
      }

      const balance = dbUser.balance - data.amount;

      if (balance < 0) {
        return c.json({ message: 'Insufficient balance' }, 400);
      }

      await db.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      });

      const commission = data.amount * (dbUser.commissionPercent / 100);

      const transaction = await db.transactions.create({
        data: {
          type: data.type,
          amount: data.amount - commission,
          userId: user.id,
          method: userMethod.method,
          identifier: userMethod.identifier,
          commissionPercent: dbUser.commissionPercent,
          commissionAmount: commission,
        },
      });

      return c.json({ success: true, data: transaction }, 201);
    }

    const transaction = await db.transactions.create({
      data: {
        type: data.type,
        amount: data.amount,
        userId: user.id,
        method: data.method,
        identifier: data.identifier!,
        description: data.description,
      },
    });

    return c.json({ success: true, data: transaction }, 201);
  });

export default app;
