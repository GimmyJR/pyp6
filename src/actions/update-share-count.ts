'use server';

import { db } from '@/lib/db';

export const updateShareCount = async (id: string, increment = 1) => {
  try {
    await db.post.update({
      where: { id },
      data: {
        sharesCount: {
          increment,
        },
      },
    });

    return {
      success: 'Share count updated successfully',
    };
  } catch (error) {
    console.error('Failed to update share count: ', error);
    return { error: 'Something went wrong!' };
  }
};
