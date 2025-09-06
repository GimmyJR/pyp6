import { db } from '@/lib/db';
import { NotificationHandlers } from '@/lib/notifications/handlers';
import { adminUpdateTransactionStatus } from '@/schemas/admin';
import { zValidator } from '@hono/zod-validator';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const transactions = await db.transactions.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!transactions.length) {
      return c.json({ message: 'No transactions found' }, 404);
    }

    return c.json({ success: true, data: transactions }, 200);
  })
  .patch(
    '/status/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', adminUpdateTransactionStatus),
    async (c) => {
      const { status } = c.req.valid('json');

      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ message: 'Transaction ID is required' }, 400);
      }

      const transaction = await db.transactions.findUnique({ where: { id } });

      if (!transaction) {
        return c.json({ message: 'Transaction not found' }, 404);
      }

      if (transaction.status === status) {
        return c.json({ message: 'Transaction already has this status' }, 400);
      }

      const dbUser = await db.user.findUnique({
        where: {
          id: transaction.userId,
        },
      });

      if (!dbUser) {
        return c.json({ message: 'User not found' }, 404);
      }

      // if transaction type is withdrawl
      if (transaction.type === TransactionType.WITHDRAWAL) {
        // if the transaction is rejected, we will increment the user balance, because we decremented the amount when the transaction was made
        if (status === TransactionStatus.REJECTED) {
          await db.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          });
        }

        // if the transactions was reject, then completed we will decrement the user balance
        if (
          transaction.status === TransactionStatus.REJECTED &&
          status === TransactionStatus.COMPLETED
        ) {
          if (dbUser.balance < transaction.amount) {
            return c.json({ message: 'Insufficient balance' }, 400);
          }

          await db.user.update({
            where: { id: transaction.userId },
            data: { balance: { decrement: transaction.amount } },
          });
        }

        // if the transaction was complete, it will be marked completed at the end of the function
      }

      if (transaction.type === TransactionType.DEPOSIT) {
        if (status === TransactionStatus.COMPLETED) {
          await db.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
          });
        }

        if (
          transaction.status === TransactionStatus.COMPLETED &&
          status === TransactionStatus.REJECTED
        ) {
          await db.user.update({
            where: { id: transaction.userId },
            data: { balance: { decrement: transaction.amount } },
          });
        }
      }

      await db.transactions.update({
        where: { id },
        data: { status },
      });

      await NotificationHandlers.sendTransactionStatusNotification(
        transaction.id
      );

      return c.json({ success: true, data: transaction }, 200);
    }
  );

export default app;
