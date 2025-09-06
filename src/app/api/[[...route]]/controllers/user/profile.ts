import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  updateUserPicSchema,
  updateUserSchema,
  updateUserSettingsSchema,
} from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
  .get('/', async (c) => {
    const user = await currentUser();
    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    // Fetch the user with their payout methods
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        PayoutMethod: true,
        _count: {
          select: {
            post: true,
          },
        },
      },
    });

    const receivedVotes = await db.vote.count({
      where: {
        post: {
          creatorId: user.id,
        },
      },
    });

    // Calculate the user's average post rating using Prisma aggregation
    const userPostsStats = await db.post.aggregate({
      where: { creatorId: user.id },
      _avg: {
        weightedRating: true,
      },
      _count: true,
    });

    let percentileStat = null;
    const userAvgRating = userPostsStats._avg.weightedRating || 0;

    // Only proceed with comparison calculation if user has posts
    if (userPostsStats._count > 0 && userAvgRating > 0) {
      // Get all creators with their average post ratings
      const creatorsWithRatings = await db.post.groupBy({
        by: ['creatorId'],
        where: {
          NOT: {
            creatorId: user.id, // Exclude current user from the query
          },
        },
        _avg: {
          weightedRating: true,
        },
        having: {
          creatorId: {
            _count: {
              gt: 0, // Only include creators with at least 1 post
            },
          },
        },
      });

      // Count how many creators have a lower average rating
      const totalCreators = creatorsWithRatings.length + 1; // +1 to include current user

      if (totalCreators > 1) {
        // Need at least one other creator for comparison
        const creatorsWithLowerRating = creatorsWithRatings.filter(
          (creator) => (creator._avg.weightedRating || 0) < userAvgRating
        ).length;

        // Calculate percentile (what percentage of creators the current user is better than)
        percentileStat = Math.round(
          (creatorsWithLowerRating / (totalCreators - 1)) * 100
        );
      }
    }

    return c.json({
      data: {
        ...dbUser,
        stats: {
          receivedVotes,
          averageRating: userAvgRating,
          percentileStat,
        },
      },
    });
  })

  .patch('/', zValidator('json', updateUserSchema), async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const data = c.req.valid('json');

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data,
    });

    return c.json({ data: updatedUser });
  })
  .patch('/pic', zValidator('json', updateUserPicSchema), async (c) => {
    const user = await currentUser();

    if (!user || !user?.id) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const data = c.req.valid('json');

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data,
    });

    return c.json({ success: true, data: updatedUser });
  })
  .patch(
    '/settings',
    zValidator('json', updateUserSettingsSchema),
    async (c) => {
      const user = await currentUser();

      if (!user || !user?.id) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      const data = c.req.valid('json');

      const updatedUser = await db.user.update({
        where: {
          id: user.id,
        },
        data,
      });

      return c.json({ success: true, data: updatedUser });
    }
  );

export default app;
