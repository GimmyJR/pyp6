import { ApprovalStatus } from '@prisma/client';
import { z } from 'zod';

export const managePostStatusSchema = z.object({
  approvalStatus: z.nativeEnum({
    PENDING: ApprovalStatus.PENDING,
    REJECTED: ApprovalStatus.REJECTED,
  }),
});
