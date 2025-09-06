import { db } from '@/lib/db';
import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) => {
  // Calculate the start date for the last 12 weeks
  const now = new Date();
  const twelveWeeksAgo = subWeeks(now, 12); // 12 weeks ago from now

  // Fetch activity data for the last 12 weeks
  const activityData = await getActivityData(twelveWeeksAgo);

  // Perform all Prisma queries inside the transaction
  const [
    userCount,
    postCount,
    commentCount,
    voteCount,
    totalVotesGivenResult,
    totalVotesReceivedResult,
    averageRatingGivenResult,
    averageRatingReceivedResult,
    totalTipsResult,
    totalTransactions,
    activeUsersLast30Days,
    postsApproved,
    postsPending,
    postsRejected,
    moderatorApplicationsCount,
  ] = await db.$transaction([
    db.user.count(),
    db.post.count(),
    db.comment.count(),
    db.vote.count(),
    db.user.aggregate({ _sum: { totalVotesGiven: true } }),
    db.post.aggregate({ _sum: { totalVotes: true } }),
    db.user.aggregate({ _avg: { averageRatingGiven: true } }),
    db.post.aggregate({ _avg: { averageRating: true } }),
    db.tip.aggregate({ _sum: { amount: true } }),
    db.transactions.count(),
    db.user.count({ where: { lastActiveAt: { gte: subWeeks(now, 4) } } }), // Last 30 days
    db.post.count({ where: { approvalStatus: 'APPROVED' } }),
    db.post.count({ where: { approvalStatus: 'PENDING' } }),
    db.post.count({ where: { approvalStatus: 'REJECTED' } }),
    db.moderatorApplication.count(),
  ]);

  // Extract values from aggregation results
  const totalVotesGiven = totalVotesGivenResult._sum.totalVotesGiven || 0;
  const totalVotesReceived = totalVotesReceivedResult._sum.totalVotes || 0;
  const averageRatingGiven =
    averageRatingGivenResult._avg.averageRatingGiven || 0;
  const averageRatingReceived =
    averageRatingReceivedResult._avg.averageRating || 0;
  const totalTips = totalTipsResult._sum.amount || 0;

  const statistics = {
    userCount,
    postCount,
    commentCount,
    voteCount,
    totalVotesGiven,
    totalVotesReceived,
    averageRatingGiven,
    averageRatingReceived,
    totalTips,
    totalTransactions,
    activeUsersLast30Days,
    postsApproved,
    postsPending,
    postsRejected,
    moderatorApplicationsCount,
    activityData, // Add activity data to the response
  };

  return c.json({ data: statistics });
});

// Helper function to fetch activity data for the last 12 weeks
async function getActivityData(startDate: Date) {
  const activityData = [];

  for (let i = 0; i < 12; i++) {
    const weekStart = startOfWeek(addWeeks(startDate, i)); // Start of the week
    const weekEnd = endOfWeek(weekStart); // End of the week

    const [users, posts, comments, votes] = await db.$transaction([
      db.user.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } }),
      db.post.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } }),
      db.comment.count({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      db.vote.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } }),
    ]);

    activityData.push({
      name: `Week ${i + 1} (${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')})`,
      users,
      posts,
      comments,
      votes,
    });
  }

  return activityData;
}

export default app;
