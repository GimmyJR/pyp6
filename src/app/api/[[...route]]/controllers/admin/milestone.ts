import { db } from '@/lib/db';
import { adminCreateMilestoneSchema } from '@/schemas/admin';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
  .get('/', (c) => {
    return c.json({ message: 'Milestone API endpoint' });
  })

  // Get all milestones
  .get('/all', async (c) => {
    const milestones = await db.milestone.findMany({
      orderBy: { threshold: 'asc' },
    });

    return c.json({
      success: true,
      data: milestones,
    });
  })

  // Create a new milestone (admin only)
  .post('/', zValidator('json', adminCreateMilestoneSchema), async (c) => {
    // Get validated data
    const data = c.req.valid('json');

    // Create the milestone
    const milestone = await db.milestone.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        threshold: data.threshold,
      },
    });

    return c.json(
      {
        success: true,
        message: 'Milestone created successfully',
        data: milestone,
      },
      201
    );
  })

  // Get milestone by ID
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json(
          {
            success: false,
            message: 'Missing Id',
          },
          400
        );
      }
      const milestone = await db.milestone.findUnique({
        where: { id },
        include: {
          UserMilestones: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              achievedAt: true,
            },
          },
        },
      });

      if (!milestone) {
        return c.json(
          {
            success: false,
            message: 'Milestone not found',
          },
          404
        );
      }

      return c.json({
        success: true,
        data: milestone,
      });
    }
  )

  // Update milestone
  .patch(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', adminCreateMilestoneSchema.partial()),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json(
          {
            success: false,
            message: 'Missing Id',
          },
          400
        );
      }
      // Check if milestone exists
      const existingMilestone = await db.milestone.findUnique({
        where: { id },
      });

      if (!existingMilestone) {
        return c.json(
          {
            success: false,
            message: 'Milestone not found',
          },
          404
        );
      }

      // Get validated data
      const data = c.req.valid('json');

      // Update the milestone
      const milestone = await db.milestone.update({
        where: { id },
        data: {
          ...data,
        },
      });

      return c.json({
        success: true,
        message: 'Milestone updated successfully',
        data: milestone,
      });
    }
  )

  // Delete milestone
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json(
          {
            success: false,
            message: 'Missing Id',
          },
          400
        );
      }

      // Check if milestone exists
      const existingMilestone = await db.milestone.findUnique({
        where: { id },
      });

      if (!existingMilestone) {
        return c.json(
          {
            success: false,
            message: 'Milestone not found',
          },
          404
        );
      }

      // Delete the milestone
      await db.milestone.delete({
        where: { id },
      });

      return c.json({
        success: true,
        message: 'Milestone deleted successfully',
      });
    }
  );

export default app;
