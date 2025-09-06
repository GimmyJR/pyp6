import {
  ApprovalStatus,
  Gender,
  MilestoneType,
  SexualOrientation,
  TransactionStatus,
  UserRole,
} from '@prisma/client';
import * as z from 'zod';

export const adminUpdateUserSchema = z.object({
  name: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email address'),

  username: z.string().min(3, 'Username must be at least 3 characters'),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.coerce.date(),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().max(250, 'Bio must not exceed 250 characters'),
  sexualOrientation: z.nativeEnum(SexualOrientation),
  role: z.nativeEnum(UserRole),

  banned: z.boolean(),
  suspended: z.coerce.date().optional(),
});

export const adminUpdateTransactionStatus = z.object({
  status: z.nativeEnum({
    COMPLETED: TransactionStatus.COMPLETED,
    REJECTED: TransactionStatus.REJECTED,
  }),
});

export const adminCreateMilestoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(MilestoneType),
  threshold: z.number().int().positive('Threshold must be a positive number'),
});

export const managePostStatusSchema = z.object({
  approvalStatus: z.nativeEnum(ApprovalStatus),
});
