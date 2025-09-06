import { db } from '@/lib/db';
import { NotificationType, UserRole } from '@prisma/client';
import { NotificationService } from './notification-service';
import { Templates } from './templates';

export const NotificationHandlers = {
  async sendPostStatusNotification(postId: string) {
    try {
      const post = await db.post.findUnique({
        where: { id: postId },
        include: { creator: true },
      });

      // Validate post and creator
      if (!post || !post.creator) {
        return null;
      }

      // Determine notification type based on current status
      const notificationType =
        post.approvalStatus === 'APPROVED'
          ? NotificationType.PHOTO_APPROVED
          : NotificationType.PHOTO_REJECTED;

      // Check for existing notification of this type for the same post
      const existingNotification = await db.notification.findFirst({
        where: {
          type: notificationType,
          userId: post.creatorId,
          data: {
            path: ['postId'],
            equals: postId,
          },
        },
      });

      if (existingNotification) {
        return null;
      }

      // Get appropriate template
      const templateData =
        post.approvalStatus === 'APPROVED'
          ? Templates.photoApproved(post.creator, post)
          : Templates.photoRejected(post.creator, post);

      // Create notification
      return await NotificationService.createNotification(notificationType, {
        userId: post.creatorId,
        title: templateData.title,
        message: templateData.message,
        data: { postId: post.id },
        email: post.creator.email || undefined,
        emailSubject: templateData.emailSubject,
        emailTemplate: templateData.emailTemplate,
      });
    } catch (error) {
      throw error;
    }
  },

  async sendTransactionStatusNotification(transactionId: string) {
    try {
      const transaction = await db.transactions.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      // Validate transaction and user
      if (!transaction || !transaction.user) {
        return null;
      }

      // Determine notification type based on status
      const notificationType =
        transaction.status === 'COMPLETED'
          ? NotificationType.TRANSACTION_COMPLETED
          : NotificationType.TRANSACTION_REJECTED;

      // Select appropriate email template
      const templateData =
        transaction.status === 'COMPLETED'
          ? Templates.transactionCompleted(transaction.user, transaction)
          : Templates.transactionRejected(transaction.user, transaction);

      // Send email notification
      return await NotificationService.createNotification(notificationType, {
        userId: transaction.userId,
        title: templateData.title,
        message: templateData.message,
        data: { transactionId: transaction.id },
        email: transaction.user.email || undefined,
        emailSubject: templateData.emailSubject,
        emailTemplate: templateData.emailTemplate,
      });
    } catch (error) {
      throw error;
    }
  },
  // Handle pending approval notifications for moderators
  async sendPendingApprovalNotifications() {
    try {
      // Get counts of pending items
      const pendingPhotos = await db.post.count({
        where: { approvalStatus: 'PENDING' },
      });

      // Get all moderators and admins
      const moderators = await db.user.findMany({
        where: {
          OR: [{ role: UserRole.MODERATOR }, { role: UserRole.ADMIN }],
        },
      });

      const results = [];

      // Send notification to each moderator
      for (const moderator of moderators) {
        if (!moderator.email) continue;

        const templateData = Templates.pendingApproval(moderator, {
          photos: pendingPhotos,
        });

        if (pendingPhotos === 0) continue; // Don't send if nothing to approve

        const notification = await NotificationService.createNotification(
          NotificationType.PENDING_APPROVAL,
          {
            userId: moderator.id,
            title: templateData.title,
            message: templateData.message,
            data: { pendingPhotos, pendingComments: 0 },
            email: moderator.email,
            emailSubject: templateData.emailSubject,
            emailTemplate: templateData.emailTemplate,
          }
        );

        results.push(notification);
      }

      return results;
    } catch (error) {
      console.error('Failed to send pending approval notifications:', error);
      throw error;
    }
  },

  // Handle pending approval notifications for moderators
  async sendPendingTransactionNotifications() {
    try {
      // Get counts of pending transactions for each type
      const pendingWithdrawals = await db.transactions.count({
        where: { status: 'PENDING', type: 'WITHDRAWAL' },
      });
      const pendingDeposits = await db.transactions.count({
        where: { status: 'PENDING', type: 'DEPOSIT' },
      });
      const pendingRefunds = await db.transactions.count({
        where: { status: 'PENDING', type: 'REFUND' },
      });

      // Get all admins
      const admins = await db.user.findMany({
        where: { role: UserRole.ADMIN },
      });

      const results = [];

      // Send notification to each admin
      for (const admin of admins) {
        if (!admin.email) continue;

        // Retrieve the list of pending transactions for each type
        const withdrawalTransactions = await db.transactions.findMany({
          where: { status: 'PENDING', type: 'WITHDRAWAL' },
          include: { user: true },
        });
        const depositTransactions = await db.transactions.findMany({
          where: { status: 'PENDING', type: 'DEPOSIT' },
          include: { user: true },
        });
        const refundTransactions = await db.transactions.findMany({
          where: { status: 'PENDING', type: 'REFUND' },
          include: { user: true },
        });

        // Prepare template data for each transaction type
        const templateData = Templates.pendingTransaction(admin, {
          withdrawalTransactions,
          depositTransactions,
          refundTransactions,
          pendingWithdrawals,
          pendingDeposits,
          pendingRefunds,
        });

        // Only send notification if there are pending transactions
        if (
          pendingWithdrawals > 0 ||
          pendingDeposits > 0 ||
          pendingRefunds > 0
        ) {
          const notification = await NotificationService.createNotification(
            NotificationType.PAYOUT_REQUEST,
            {
              userId: admin.id,
              title: templateData.title,
              message: templateData.message,
              data: {
                pendingWithdrawals,
                pendingDeposits,
                pendingRefunds,
              },
              email: admin.email,
              emailSubject: templateData.emailSubject,
              emailTemplate: templateData.emailTemplate,
            }
          );

          results.push(notification);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to send pending transaction notifications:', error);
      throw error;
    }
  },

  // Handle tip received notifications
  async sendTipReceivedNotification(tipId: string) {
    try {
      const tip = await db.tip.findUnique({
        where: { id: tipId },
        include: {
          creator: true,
          user: true,
          post: true,
        },
      });

      if (!tip) {
        return null;
      }

      // Determine if sender is anonymous
      let senderName;
      if (tip.user) {
        const isAnonymous = tip.user.anonymous;
        senderName = isAnonymous
          ? undefined
          : tip.user.username || tip.user.name;
      }

      const templateData = Templates.tipReceived(
        tip.creator,
        tip,
        senderName ?? undefined
      );

      return await NotificationService.createNotification(
        NotificationType.TIP_RECEIVED,
        {
          userId: tip.creatorId,
          title: templateData.title,
          message: templateData.message,
          data: {
            tipId: tip.id,
            postId: tip.postId,
            amount: tip.amount,
            senderId: senderName ? tip.userId : undefined,
          },
          email: tip.creator.email || undefined,
          emailSubject: templateData.emailSubject,
          emailTemplate: templateData.emailTemplate,
        }
      );
    } catch (error) {
      console.error('Failed to send tip received notification:', error);
      throw error;
    }
  },

  // Handle post rejected due to report notification
  async sendPostRejectedDueToReportNotification(
    postId: string,
    reportReason?: string
  ) {
    try {
      const post = await db.post.findUnique({
        where: { id: postId },
        include: { creator: true },
      });

      // Validate post and creator
      if (!post || !post.creator) {
        return null;
      }

      // Check for existing notification for this post rejection
      const existingNotification = await db.notification.findFirst({
        where: {
          type: NotificationType.PHOTO_REJECTED,
          userId: post.creatorId,
          data: {
            path: ['postId'],
            equals: postId,
          },
        },
      });

      if (existingNotification) {
        return null; // Don't send duplicate notifications
      }

      // Get template with report rejection details
      const templateData = Templates.postReportRejected(
        post.creator,
        post,
        reportReason
      );

      // Create notification
      return await NotificationService.createNotification(
        NotificationType.PHOTO_REJECTED, // Reusing existing notification type for post rejections
        {
          userId: post.creatorId,
          title: templateData.title,
          message: templateData.message,
          data: {
            postId: post.id,
            reportReason: reportReason || 'Violation of community guidelines',
          },
          email: post.creator.email || undefined,
          emailSubject: templateData.emailSubject,
          emailTemplate: templateData.emailTemplate,
        }
      );
    } catch (error) {
      console.error(
        'Failed to send post rejected due to report notification:',
        error
      );
      throw error;
    }
  },
};
