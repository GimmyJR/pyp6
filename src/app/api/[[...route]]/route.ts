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

// User routes
const userRoutes = app
  .get('/user/profile', async (c) => {
    try {
      console.log('🔍 Starting user profile fetch...');
      
      // Test database connection first
      try {
        await db.$connect();
        console.log('✅ Database connected successfully');
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError);
        return c.json({ error: 'Database connection failed', details: dbError.message }, 500);
      }

      // Get user from JWT token
      const user = await getCurrentUser(c.req.raw);
      console.log('👤 Current user:', user ? `${user.id} (${user.email})` : 'null');
      
      if (!user || !user.id) {
        console.log('🚫 User not authenticated');
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
        console.log('👤 User profile found:', userProfile ? 'yes' : 'no');
      } catch (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        return c.json({ error: 'Failed to fetch user profile', details: profileError.message }, 500);
      }

      if (!userProfile) {
        console.log('❌ User profile not found in database');
        return c.json({ error: 'User not found' }, 404);
      }

      // Calculate user stats
      let userPosts = [];
      try {
        userPosts = await db.post.findMany({
          where: { creatorId: user.id },
          select: { averageRating: true, totalVotes: true },
        });
        console.log('📝 User posts count:', userPosts.length);
      } catch (postsError) {
        console.error('❌ Error fetching user posts:', postsError);
        userPosts = []; // Continue with empty posts if this fails
      }

      const averageRating = userPosts.length > 0 
        ? userPosts.reduce((acc, post) => acc + post.averageRating, 0) / userPosts.length
        : 0;

      const receivedVotes = userPosts.reduce((acc, post) => acc + post.totalVotes, 0);

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
        console.log('📊 Stats calculated - Total users:', totalUsers, 'Percentile:', percentileStat);
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

      console.log('✅ Profile data prepared successfully');
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

      return c.json({ data });
    } catch (error) {
      console.error('Error fetching next milestone:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

export type AppType = typeof userRoutes;

// Export handlers for Next.js App Router
export const GET = (req: Request, context: any) => app.fetch(req, context);
export const POST = (req: Request, context: any) => app.fetch(req, context);
export const PATCH = (req: Request, context: any) => app.fetch(req, context);
export const DELETE = (req: Request, context: any) => app.fetch(req, context);

