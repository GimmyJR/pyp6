import { db } from '@/lib/db';
import { NotificationType } from '@prisma/client';
import nodemailer from 'nodemailer';

// Initialize nodemailer transporter with Resend SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  data?: unknown;
  email?: string; // Optional email to send to (for non-user notifications)
  emailSubject?: string;
  emailTemplate?: string;
}

export class NotificationService {
  // Create a notification and optionally send an email
  static async createNotification(
    type: NotificationType,
    payload: NotificationPayload
  ) {
    try {
      // Create notification record
      const notification = await db.notification.create({
        data: {
          type,
          userId: payload.userId,
          title: payload.title,
          message: payload.message,
          data: payload.data || {},
        },
      });

      // Send email if email is provided
      if (payload.email) {
        await this.sendEmail({
          to: payload.email,
          subject: payload.emailSubject || payload.title,
          html: payload.emailTemplate || `<p>${payload.message}</p>`,
        });

        // Mark notification as emailed
        await db.notification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        });
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Send email only
  static async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text: text || '',
        html,
      });

      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }
}
