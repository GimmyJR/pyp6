import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

import { db } from '@/lib/db';
import { convertAmountToMiliunits } from '@/lib/utils';

const app = new Hono().basePath('/api');

// Helper function to get user from JWT token
async function getCurrentUser(req: Request) {
  try {
    const token = await getToken({ 
      req: req as any,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    });
    
    if (!token?.sub) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: token.sub }
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// User routes and others
const routes = app
  .get('/user/profile', async (c) => {
    try {
      // Get user from JWT token
      const user = await getCurrentUser(c.req.raw);
      
      if (!user || !user.id) {
        return c.json({ error: 'Unauthorized - Please sign in first' }, 401);
      }

      // Get user profile with stats
      let userProfile;
      try {
        userProfile = await db.user.findUnique({
          where: { id: user.id },
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
                votes: true,
              },
            },
          },
        });
      } catch (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        return c.json({ error: 'Failed to fetch user profile', details: profileError.message }, 500);
      }

      if (!userProfile) {
        console.log('❌ User profile not found in database');
        return c.json({ error: 'User not found' }, 404);
      }

      // Calculate user stats via aggregate for performance
      let averageRating = 0;
      let receivedVotes = 0;
      try {
        const agg = await db.post.aggregate({
          where: { creatorId: user.id },
          _avg: { averageRating: true },
          _sum: { totalVotes: true },
        });
        averageRating = agg._avg.averageRating ?? 0;
        receivedVotes = agg._sum.totalVotes ?? 0;
      } catch (postsError) {
        console.error('❌ Error aggregating user posts:', postsError);
      }

      // Calculate percentile stat
      let percentileStat = 0;
      try {
        const totalUsers = await db.user.count();
        const betterThanCount = await db.user.count({
          where: {
            activityScore: {
              lt: userProfile.activityScore || 0,
            },
          },
        });
        percentileStat = totalUsers > 0 ? Math.round((betterThanCount / totalUsers) * 100) : 0;
      } catch (statsError) {
        console.error('⚠️ Error calculating stats:', statsError);
      }

      const data = {
        id: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        email: userProfile.email,
        image: userProfile.image,
        bio: userProfile.bio,
        isVerified: userProfile.isVerified,
        anonymous: false,
        sent_email_notifications: true,
        balance: convertAmountToMiliunits(0),
        totalSpent: convertAmountToMiliunits(userProfile.totalSpent || 0),
        _count: {
          post: userProfile._count.posts,
        },
        stats: {
          averageRating,
          receivedVotes,
          percentileStat,
        },
      };

      c.header('Cache-Control', 'private, max-age=60');
      return c.json({ data });
    } catch (error) {
      console.error('💥 Unexpected error in user profile endpoint:', error);
      return c.json({ 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 500);
    }
  })
  .patch('/user/profile', 
    zValidator('json', z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      username: z.string().optional(),
    })),
    async (c) => {
      try {
        const user = await getCurrentUser(c.req.raw);
        
        if (!user || !user.id) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        const { name, bio, username } = c.req.valid('json');

        const updatedUser = await db.user.update({
          where: { id: user.id },
          data: {
            ...(name && { name }),
            ...(bio && { bio }),
            ...(username && { username }),
          },
        });

        return c.json({ data: updatedUser });
      } catch (error) {
        console.error('Error updating user profile:', error);
        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  )
  .get('/user/post', async (c) => {
    try {
      const user = await getCurrentUser(c.req.raw);
      
      if (!user || !user.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const posts = await db.post.findMany({
        where: { creatorId: user.id },
        include: {
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      c.header('Cache-Control', 'private, max-age=30');
      return c.json({ data: posts });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .get('/user/milestone/next', async (c) => {
    try {
      const user = await getCurrentUser(c.req.raw);
      
      if (!user || !user.id) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Get the next milestone based on user's activity score
      const nextMilestone = await db.milestone.findFirst({
        where: {
          targetValue: {
            gt: user.activityScore || 0,
          },
          isActive: true,
        },
        orderBy: { targetValue: 'asc' },
      });

      if (!nextMilestone) {
        return c.json({ data: null });
      }

      const progress = user.activityScore 
        ? Math.min((user.activityScore / nextMilestone.targetValue) * 100, 100)
        : 0;

      const data = {
        nextMilestone: {
          ...nextMilestone,
          progress,
          description: nextMilestone.description || `Reach ${nextMilestone.targetValue} activity points to unlock ${nextMilestone.name}`,
        },
      };

      c.header('Cache-Control', 'private, max-age=120');
      return c.json({ data });
    } catch (error) {
      console.error('Error fetching next milestone:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

// Posts listing with pagination and optional filters
routes.get('/post', async (c) => {
  try {
    const url = new URL(c.req.url);
    const pageParam = url.searchParams.get('page') || '1';
    const preference = url.searchParams.get('preference') as any | null; // Gender or null
    const id = url.searchParams.get('id');

    const page = Math.max(parseInt(pageParam, 10) || 1, 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
      approvalStatus: 'APPROVED',
      ...(preference ? { creator: { gender: preference } } : {}),
    };

    // Optional requested post
    const requestedPost = id
      ? await db.post.findUnique({
          where: { id },
          include: {
            creator: { select: { id: true, name: true, image: true, gender: true } },
            _count: { select: { votes: true } },
            votes: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: { voter: { select: { id: true, name: true, image: true } } },
            },
          },
        })
      : null;

    const [items, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, image: true, gender: true } },
          _count: { select: { votes: true } },
          votes: {
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { voter: { select: { id: true, name: true, image: true } } },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
        skip,
      }),
      db.post.count({ where }),
    ]);

    // Map to expected shape: rename votes->_count.vote and votes array to vote
    const mapPost = (p: any) => ({
      ...p,
      vote: p.votes ?? [],
      _count: { ...p._count, vote: p._count?.votes ?? 0 },
    });

    const data = [
      ...(requestedPost ? [requestedPost] : []),
      ...items.filter((it) => it.id !== requestedPost?.id),
    ].map(mapPost);

    const hasMore = skip + limit < total;
    c.header('Cache-Control', 'private, max-age=30');
    return c.json({ data, hasMore, nextPage: hasMore ? page + 1 : page });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// Single post by id
routes.get('/post/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (!id) return c.json({ error: 'Missing id' }, 400);

    const post = await db.post.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, image: true, gender: true } },
        _count: { select: { votes: true } },
        votes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { voter: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (!post) return c.json({ error: 'Post not found' }, 404);

    const mapped = { ...post, vote: post.votes ?? [], _count: { ...post._count, vote: post._count?.votes ?? 0 } };
    return c.json({ data: mapped });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// Top creators today (simple heuristic)
routes.get('/post/top-creators-today', async (c) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayPosts = await db.post.findMany({
      where: {
        approvalStatus: 'APPROVED',
        updatedAt: { gte: start, lte: end },
      },
      include: {
        creator: { select: { id: true, name: true, image: true, isVerified: true, activityScore: true, gender: true } },
        _count: { select: { votes: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: 100,
    });

    const scored = todayPosts
      .map((p: any) => ({
        ...p,
        engagementScore: (p._count?.votes ?? 0) * 2 + (p.impressions ?? 0) * 0.5 + (p.averageRating ?? 0) * 5,
      }))
      .sort((a: any, b: any) => b.engagementScore - a.engagementScore)
      .slice(0, 3)
      .map((p: any) => ({
        id: p.id,
        caption: p.caption,
        image: p.image,
        creator: p.creator,
        engagementScore: p.engagementScore,
        totalVotes: p._count?.votes ?? 0,
        impressions: p.impressions ?? 0,
      }));

    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return c.json({ data: scored });
  } catch (error: any) {
    console.error('Error fetching top creators today:', error);
    return c.json({ error: 'Failed to fetch top creators' }, 500);
  }
});

export type AppType = typeof routes;

// Export handlers for Next.js App Router
export const GET = (req: Request, context: any) => app.fetch(req, context);
export const POST = (req: Request, context: any) => app.fetch(req, context);
export const PATCH = (req: Request, context: any) => app.fetch(req, context);
export const DELETE = (req: Request, context: any) => app.fetch(req, context);

