import { Post, Tip, Transactions, User, UserRole } from '@prisma/client';
import { convertAmountFromMiliunits, formatCurrency } from '../utils';

export const Templates = {
  // Photo approval notification
  photoApproved: (user: User, post: Post) => {
    return {
      title: 'Your photo has been approved!',
      message: `Your photo "${post.caption || 'Untitled'}" has been approved and is now visible to everyone.`,
      emailSubject: 'Photo Approved - Your Content is Now Live',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Photo Has Been Approved! 🎉</h2>
          <p>Hello ${user.name || user.username || 'there'},</p>
          <p>Good news! Your photo${post.caption ? ` "${post.caption}"` : ''} has been approved by our moderation team and is now live on the platform.</p>
          <div style="margin: 20px 0;">
            <img src="${post.image}" alt="Your approved photo" style="max-width: 100%; height: auto; border-radius: 8px;" />
          </div>
          <p>Start sharing your post to get more votes and tips!</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">Thank you for contributing to our community.</p>
          </div>
        </div>
      `,
    };
  },
  // photo rejected notification
  photoRejected: (user: User, post: Post) => {
    return {
      title: 'Your photo has been rejected!',
      message: `Your photo "${post.caption || 'Untitled'}" has been rejected and it's not visible to everyone.`,
      emailSubject: 'Photo Rejected - Content Moderation Update',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Photo Submission Rejected 🚫</h2>
          <p>Hello ${user.name || user.username || 'there'},</p>
          <p>We regret to inform you that your photo${post.caption ? ` "${post.caption}"` : ''} has been rejected by our moderation team and will not be published on the platform.</p>
          <div style="margin: 20px 0;">
            <img src="${post.image}" alt="Rejected photo" style="max-width: 100%; height: auto; border-radius: 8px; filter: grayscale(100%) opacity(50%);" />
          </div>
          <p>Reason for Rejection: Content does not meet our community guidelines.</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">Please review our content guidelines and try submitting again.</p>
          </div>
        </div>
      `,
    };
  },
  transactionCompleted: (user: User, transaction: Transactions) => ({
    title: 'Transaction Completed 🎉',
    message: `Your transaction of $${transaction.amount / 100} has been processed successfully.`,
    emailSubject: 'Transaction Completed - Funds Updated',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Transaction Completed 🎉</h2>
        <p>Hello ${user.name || user.username || 'there'},</p>
        <p>Your transaction of <strong>$${transaction.amount / 100}</strong> has been successfully processed.</p>
        <p>Thank you for using our platform.</p>
      </div>
    `,
  }),

  transactionRejected: (user: User, transaction: Transactions) => ({
    title: 'Transaction Rejected ❌',
    message: `Your transaction of $${transaction.amount / 100} has been rejected.`,
    emailSubject: 'Transaction Rejected - Action Required',
    emailTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Transaction Rejected ❌</h2>
        <p>Hello ${user.name || user.username || 'there'},</p>
        <p>Unfortunately, your transaction of <strong>$${transaction.amount / 100}</strong> has been rejected.</p>
        <p>Please check your account or contact support for more details.</p>
      </div>
    `,
  }),
  // Moderator notification for pending approvals
  pendingApproval: (moderator: User, counts: { photos: number }) => {
    return {
      title: 'Content Awaiting Approval',
      message: `There are ${counts.photos} photos waiting for your review.`,
      emailSubject: 'Moderation Queue Update',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Content Needs Your Attention</h2>
          <p>Hello ${moderator.name || moderator.username || 'Moderator'},</p>
          <p>The moderation queue has content waiting for your review:</p>
          <ul style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <li><strong>${counts.photos} photos</strong> pending review</li>
          </ul>
          <p>Please log in to your moderator dashboard to review this content.</p>
          <div style="margin-top: 20px;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }${moderator.role === UserRole.ADMIN ? '/admin/posts' : '/moderator/posts'}" style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>
        </div>
      `,
    };
  },

  // Admin notification for payout requests
  pendingTransaction: (
    admin: User,
    data: {
      withdrawalTransactions: (Transactions & {
        user: User;
      })[];
      depositTransactions: (Transactions & {
        user: User;
      })[];
      refundTransactions: (Transactions & {
        user: User;
      })[];
      pendingWithdrawals: number;
      pendingDeposits: number;
      pendingRefunds: number;
    }
  ) => {
    return {
      title: `Transaction Requests Pending Review`,
      message: `There are ${data.pendingWithdrawals} withdrawal requests, ${data.pendingDeposits} deposit requests, and ${data.pendingRefunds} refund requests awaiting your approval.`,
      emailSubject: 'Pending Transaction Requests Require Your Attention',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Pending Transaction Requests</h2>
          <p>Hello ${admin.name || admin.username || 'Admin'},</p>
          <p>There are pending transaction requests awaiting your action:</p>
  
          ${
            data.pendingWithdrawals > 0
              ? `
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Withdrawals (${data.pendingWithdrawals})</h3>
              ${data.withdrawalTransactions
                .map((transaction) => {
                  return `
                    <p><strong>User:</strong> ${transaction.user.username || transaction.user.name || transaction.user.id}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(convertAmountFromMiliunits(transaction.amount))}</p>
                    <p><strong>Method:</strong> ${transaction.method}</p>
                    <p><strong>Requested:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    <hr />
                  `;
                })
                .join('')}
            </div>
          `
              : ''
          }
  
          ${
            data.pendingDeposits > 0
              ? `
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Deposits (${data.pendingDeposits})</h3>
              ${data.depositTransactions
                .map((transaction) => {
                  return `
                    <p><strong>User:</strong> ${transaction.user.username || transaction.user.name || transaction.user.id}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(convertAmountFromMiliunits(transaction.amount))}</p>
                    <p><strong>Method:</strong> ${transaction.method}</p>
                    <p><strong>Requested:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    <hr />
                  `;
                })
                .join('')}
            </div>
          `
              : ''
          }
  
          ${
            data.pendingRefunds > 0
              ? `
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Refunds (${data.pendingRefunds})</h3>
              ${data.refundTransactions
                .map((transaction) => {
                  return `
                    <p><strong>User:</strong> ${transaction.user.username || transaction.user.name || transaction.user.id}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(convertAmountFromMiliunits(transaction.amount))}</p>
                    <p><strong>Method:</strong> ${transaction.method}</p>
                    <p><strong>Requested:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    <hr />
                  `;
                })
                .join('')}
            </div>
          `
              : ''
          }
  
          <p>Please review these requests on the admin dashboard.</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/transactions" style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px;">Review Requests</a>
          </div>
        </div>
      `,
    };
  },

  // Tip received notification
  tipReceived: (receiver: User, tip: Tip, senderName?: string) => {
    const tipAmount = (tip.amount / 100).toFixed(2);
    const isAnonymous = !senderName;

    return {
      title: 'You Received a Tip!',
      message: `You received a $${tipAmount} tip${
        isAnonymous ? '' : ` from ${senderName}`
      } on your post.`,
      emailSubject: 'You Received a Tip! 💰',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You Received a Tip! 💰</h2>
          <p>Hello ${receiver.name || receiver.username || 'there'},</p>
          <div style="background-color: #f8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6200ea;">
            <p style="font-size: 18px; margin-bottom: 10px;">Someone appreciated your content!</p>
            <p style="font-size: 24px; font-weight: bold; color: #6200ea;">$${tipAmount}</p>
            <p>${
              isAnonymous
                ? 'An anonymous user'
                : `<strong>${senderName}</strong>`
            } sent you a tip on your post.</p>
          </div>
          <p>Your new balance is $${(
            (receiver.balance + tip.amount) /
            100
          ).toFixed(2)}.</p>
          <p>Keep creating amazing content!</p>
        </div>
      `,
    };
  },

  // Balance update notification
  balanceUpdated: (user: User, transaction: Transactions) => {
    const amount = (transaction.amount / 100).toFixed(2);
    const isCredit = transaction.type === 'DEPOSIT';

    return {
      title: `Balance ${isCredit ? 'Added' : 'Updated'}`,
      message: `$${amount} has been ${
        isCredit ? 'added to' : 'withdrawn from'
      } your account.`,
      emailSubject: `Your Account Balance Has Been ${
        isCredit ? 'Credited' : 'Updated'
      }`,
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Balance Update</h2>
          <p>Hello ${user.name || user.username || 'there'},</p>
          <div style="background-color: ${
            isCredit ? '#f0f9f0' : '#f9f0f0'
          }; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
            isCredit ? '#2e7d32' : '#c62828'
          };">
            <p style="font-size: 18px; margin-bottom: 10px;">Transaction Completed</p>
            <p style="font-size: 24px; font-weight: bold; color: ${
              isCredit ? '#2e7d32' : '#c62828'
            };">${isCredit ? '+' : '-'}$${amount}</p>
            <p><strong>Transaction Type:</strong> ${transaction.type}</p>
            <p><strong>Description:</strong> ${
              transaction.description || 'No description provided'
            }</p>
            <p><strong>Date:</strong> ${new Date(
              transaction.createdAt
            ).toLocaleString()}</p>
          </div>
          <p>Your new balance is $${(user.balance / 100).toFixed(2)}.</p>
        </div>
      `,
    };
  },

  // Post rejected due to report notification
  postReportRejected: (user: User, post: Post, reportReason?: string) => {
    return {
      title: 'Your post has been removed due to a violation report',
      message: `Your photo "${post.caption || 'Untitled'}" has been removed after being reported by a user.`,
      emailSubject: 'Post Removed - Community Guidelines Violation',
      emailTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Post Removal Notice ❌</h2>
          <p>Hello ${user.name || user.username || 'there'},</p>
          <p>We regret to inform you that your post${post.caption ? ` "${post.caption}"` : ''} has been removed from our platform following a user report that was reviewed by our moderation team.</p>
          <div style="margin: 20px 0;">
            <img src="${post.image}" alt="Removed photo" style="max-width: 100%; height: auto; border-radius: 8px; filter: grayscale(100%) opacity(50%);" />
          </div>
          <p><strong>Reason for Removal:</strong> ${reportReason || 'Violation of community guidelines'}</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">Please review our community guidelines to ensure your future submissions comply with our standards.</p>
          </div>
        </div>
      `,
    };
  },
};
