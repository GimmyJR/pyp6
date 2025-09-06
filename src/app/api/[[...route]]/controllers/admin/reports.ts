import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { zValidator } from '@hono/zod-validator';
import { ApprovalStatus } from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', async (c) => {
    const reports = await db.reports.findMany({
      include: {
        user: true,
        post: {
          include: {
            creator: true,
          },
        },
        faqs: true,
        ReportUpdateLog: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return c.json({ data: reports });
  })
  .patch(
    '/:id/updateStatus',
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator('json', z.object({ status: z.nativeEnum(ApprovalStatus) })),
    async (c) => {
      const { id } = c.req.valid('param');
      const { status } = c.req.valid('json');

      const user = await currentUser();

      if (!user || !user?.id) {
        return c.json({ message: 'Unauthorized!' }, 401);
      }

      if (!id) {
        return c.json({ message: 'ID is required' }, 400);
      }

      const report = await db.reports.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      if (status === 'APPROVED') {
        const post = await db.post.update({
          where: {
            id: report.postId,
          },
          data: {
            approvalStatus: 'REJECTED',
          },
        });

        // Send notification informing user that their post was rejected due to a report
        const { NotificationHandlers } = await import(
          '@/lib/notifications/handlers'
        );
        await NotificationHandlers.sendPostRejectedDueToReportNotification(
          report.postId,
          report.reason
        );
      }

      const reportLog = await db.reportUpdateLog.create({
        data: {
          reportId: id,
          comment: `${user.name} with email ${user.email} updated the report status to ${status}`,
          userId: user.id,
        },
      });

      return c.json({ data: report });
    }
  );

export default app;
