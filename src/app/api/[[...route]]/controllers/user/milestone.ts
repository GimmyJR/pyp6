import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { client } from '@/lib/hono';
import { Milestone } from '@prisma/client';
import { Hono } from 'hono';

const app = new Hono()
  .get('/', async (c) => {
    const user = await currentUser();

    if (!user || !user.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        totalSpent: true,
        commentCount: true,
        photoCount: true,
        votingStreak: true,
        totalVotesGiven: true,
        UserMilestone: {
          include: {
            milestone: true,
          },
        },
      },
    });

    if (!dbUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // check achieved milestones
    await checkAchievedMilestone();

    // Get all possible milestones
    const allMilestones = await db.milestone.findMany({
      orderBy: [{ type: 'asc' }, { threshold: 'asc' }],
    });

    // Separate achieved and remaining milestones
    const achievedMilestoneIds = dbUser.UserMilestone.map(
      (um) => um.milestoneId
    );

    const achievedMilestones = dbUser.UserMilestone.map((um) => ({
      ...um.milestone,
      achievedAt: um.achievedAt,
    }));

    // Calculate progress for remaining milestones
    const remainingMilestones = allMilestones
      .filter((milestone) => !achievedMilestoneIds.includes(milestone.id))
      .map((milestone) => {
        let currentValue = 0;
        let progress = 0;

        // Determine current value based on milestone type
        switch (milestone.type) {
          case 'CASH_OUT':
            (async () => {
              // Count successful withdrawal transactions
              const cashoutTransactions = await db.transactions.count({
                where: {
                  userId: dbUser.id,
                  type: 'WITHDRAWAL',
                  status: 'COMPLETED',
                },
              });
              currentValue = cashoutTransactions;
            })();
            break;
          case 'EARNINGS':
            currentValue = dbUser.totalSpent;
            break;
          case 'VOTE_COUNT':
            currentValue = dbUser.totalVotesGiven;
            break;
          case 'COMMENT_COUNT':
            currentValue = dbUser.commentCount;
            break;
          case 'PHOTO_COUNT':
            currentValue = dbUser.photoCount;
            break;
          case 'VOTING_STREAK':
            currentValue = dbUser.votingStreak;
            break;
          default:
            currentValue = 0;
        }

        // Calculate progress percentage
        progress = Math.min(
          Math.round((currentValue / milestone.threshold) * 100),
          100
        );

        return {
          ...milestone,
          currentValue,
          progress,
          remaining: Math.max(milestone.threshold - currentValue, 0),
        };
      });

    // Group milestones by type for better organization
    const groupedAchieved = groupMilestonesByType(achievedMilestones);
    const groupedRemaining = groupMilestonesByType(remainingMilestones);

    return c.json(
      {
        data: {
          achieved: {
            count: achievedMilestones.length,
            milestones: achievedMilestones,
            byType: groupedAchieved,
          },
          remaining: {
            count: remainingMilestones.length,
            milestones: remainingMilestones,
            byType: groupedRemaining,
          },
        },
      },
      200
    );
  })
  .get('/next', async (c) => {
    const user = await currentUser();

    // Check if user is logged in
    if (!user || !user?.id) {
      return c.json(
        {
          success: false,
          message: 'You must be logged in to view your next milestone',
        },
        401
      );
    }

    // Get user with their achievements and stats
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        totalSpent: true,
        commentCount: true,
        photoCount: true,
        votingStreak: true,
        totalVotesGiven: true,
        UserMilestone: {
          select: {
            milestoneId: true,
          },
        },
      },
    });

    if (!dbUser) {
      return c.json(
        {
          success: false,
          message: 'User data not found',
        },
        404
      );
    }

    // Get all milestones the user hasn't achieved yet
    const achievedMilestoneIds = dbUser.UserMilestone.map(
      (um) => um.milestoneId
    );

    const unachievedMilestones = await db.milestone.findMany({
      where: {
        id: {
          notIn: achievedMilestoneIds,
        },
      },
    });

    if (unachievedMilestones.length === 0) {
      return c.json({
        success: true,
        data: {
          message:
            'Congratulations! You have achieved all available milestones.',
          nextMilestone: null,
          progress: 100,
        },
      });
    }

    // Calculate progress for each unachieved milestone
    const milestonesWithProgress = await Promise.all(
      unachievedMilestones.map(async (milestone) => {
        let currentValue = 0;

        // Determine current value based on milestone type
        switch (milestone.type) {
          case 'CASH_OUT':
            // Count successful withdrawal transactions
            const cashoutTransactions = await db.transactions.count({
              where: {
                userId: dbUser.id,
                type: 'WITHDRAWAL',
                status: 'COMPLETED',
              },
            });
            currentValue = cashoutTransactions;
            break;
          case 'EARNINGS':
            currentValue = dbUser.totalSpent;
            break;
          case 'VOTE_COUNT':
            currentValue = dbUser.totalVotesGiven;
            break;
          case 'COMMENT_COUNT':
            currentValue = dbUser.commentCount;
            break;
          case 'PHOTO_COUNT':
            currentValue = dbUser.photoCount;
            break;
          case 'VOTING_STREAK':
            currentValue = dbUser.votingStreak;
            break;
          default:
            currentValue = 0;
        }

        // Calculate progress percentage (capped at 100%)
        const progress = Math.min(
          Math.round((currentValue / milestone.threshold) * 100),
          100
        );
        const remaining = Math.max(milestone.threshold - currentValue, 0);

        return {
          ...milestone,
          currentValue,
          progress,
          remaining,
        };
      })
    );

    // Sort by progress in descending order (closest to completion first)
    milestonesWithProgress.sort((a, b) => b.progress - a.progress);

    // Get the milestone with the highest progress
    const nextMilestone = milestonesWithProgress[0];

    // Get the next milestone grouped with others of the same type
    const similarMilestones = milestonesWithProgress
      .filter((m) => m.type === nextMilestone.type)
      .sort((a, b) => a.threshold - b.threshold);

    return c.json({
      success: true,
      data: {
        nextMilestone,
        similarMilestones:
          similarMilestones.length > 1 ? similarMilestones : [],
        remainingMilestoneCount: milestonesWithProgress.length,
      },
    });
  })
  .post('/check', async (c) => {
    const user = await currentUser();

    if (!user || !user.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        balance: true,
        totalSpent: true,
        commentCount: true,
        photoCount: true,
        votingStreak: true,
        totalVotesGiven: true,
        UserMilestone: {
          select: {
            milestoneId: true,
          },
        },
      },
    });

    if (!dbUser) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all achieved milestone IDs
    const achievedMilestoneIds = dbUser.UserMilestone.map(
      (um) => um.milestoneId
    );

    // Get all milestones the user hasn't achieved yet
    const unachievedMilestones = await db.milestone.findMany({
      where: {
        id: {
          notIn: achievedMilestoneIds,
        },
      },
    });

    // Check each milestone to see if the user has met the criteria
    const newlyAchievedMilestones = [];

    for (const milestone of unachievedMilestones) {
      let achieved = false;

      // Check if user meets the threshold based on milestone type
      switch (milestone.type) {
        case 'CASH_OUT':
          (async () => {
            const cashoutCount = await db.transactions.count({
              where: {
                userId: dbUser.id,
                type: 'WITHDRAWAL',
                status: 'COMPLETED',
              },
            });
            achieved = cashoutCount >= milestone.threshold;
          })();
          break;
        case 'EARNINGS':
          achieved = dbUser.totalSpent >= milestone.threshold;
          break;
        case 'VOTE_COUNT':
          achieved = dbUser.totalVotesGiven >= milestone.threshold;
          break;
        case 'COMMENT_COUNT':
          achieved = dbUser.commentCount >= milestone.threshold;
          break;
        case 'PHOTO_COUNT':
          achieved = dbUser.photoCount >= milestone.threshold;
          break;
        case 'VOTING_STREAK':
          achieved = dbUser.votingStreak >= milestone.threshold;
          break;
        default:
          achieved = false;
      }

      // If milestone is achieved, create a record and prepare rewards
      if (achieved) {
        await db.userMilestone.create({
          data: {
            userId: user.id,
            milestoneId: milestone.id,
            achievedAt: new Date(),
          },
        });

        newlyAchievedMilestones.push(milestone);
      }
    }

    // Create activity log entries for newly achieved milestones
    if (newlyAchievedMilestones.length > 0) {
      for (const milestone of newlyAchievedMilestones) {
        await db.userActivityLog.create({
          data: {
            userId: user.id,
            actionType: 'MILESTONE_ACHIEVED',
            details: {
              milestoneId: milestone.id,
              milestoneName: milestone.name,
            },
          },
        });
      }
    }

    return c.json(
      {
        data: newlyAchievedMilestones,
      },
      200
    );
  });

export default app;

/**
 * Helper function to group milestones by their type
 */
function groupMilestonesByType(milestones: Milestone[]) {
  return milestones.reduce((acc: Record<string, Milestone[]>, milestone) => {
    const type = milestone.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(milestone);
    return acc;
  }, {});
}

async function checkAchievedMilestone() {
  const response = await client.api.user.milestone.check.$post();

  return response;
}
