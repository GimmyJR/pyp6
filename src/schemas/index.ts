import {
  AvailablePayoutMethods,
  Gender,
  InquiryType,
  SexualOrientation,
  TransactionType,
} from '@prisma/client';
import * as z from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Email is required.',
    })
    .email({ message: 'Invalid Email.' }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, {
        message: 'Email is required.',
      })
      .email({ message: 'Invalid Email.' }),

    username: z.string().min(1, {
      message: 'username is required.',
    }),
    dateOfBirth: z.coerce.date().refine(
      (date) => {
        const today = new Date();
        const minAge = new Date(
          today.getFullYear() - 16,
          today.getMonth(),
          today.getDate()
        );
        return date <= minAge;
      },
      { message: 'You must be at least 16 years old' }
    ),
    image: z.string().url({ message: 'Must be a valid image URL' }).optional(),
    gender: z.nativeEnum(Gender, {
      message: 'Please Select a Gender',
    }),
    sexualOrientation: z.nativeEnum(SexualOrientation, {
      message: 'Please Select a Sexual Orientation',
    }),
    password: z.string().min(6, {
      message: 'Minimum 6 characters required.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const ModeratorApplicationSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  profileLink: z
    .string()
    .min(1, { message: 'Profile link is required' })
    .url({ message: 'Must be a valid URL' }),
  gender: z.nativeEnum(Gender, {
    message: 'Please Select a Gender',
  }),
  age: z
    .string()
    .regex(/^\d+$/, { message: 'Please enter a valid age' })
    .refine((val) => Number(val) >= 13, {
      message: 'You must be at least 13 years old',
    })
    .refine((val) => Number(val) <= 120, {
      message: 'Please enter a valid age',
    }),
  location: z.string().min(1, { message: 'Location is required' }),
  dedicatedTimePerWeek: z.string().min(1, { message: 'Time is required' }),
  moderatorStatement: z
    .string()
    .min(10, { message: 'Please write at least 10 characters' })
    .max(500, { message: 'Maximum 100 words allowed' })
    .refine((text) => text.split(/\s+/).length <= 100, {
      message: 'Please limit your response to 100 words',
    }),
});

export const PostSchema = z.object({
  caption: z.string().optional(),
  tags: z.string().optional(),
  image: z.string().url({ message: 'Must be a valid image URL' }),
});

export const commentSchema = z.object({
  comment: z.string().min(1, { message: 'Comment is required' }).max(170 , {message: "Comment must not exceed 170 characters"}),
});

export const voteSchema = z.object({
  rating: z
    .number()
    .min(1, { message: 'Vote is required!' })
    .max(10, { message: 'Vote must be between 1 and 10' }),
});

export const updateVoteSchema = z
  .object({
    rating: z
      .number()
      .min(1, { message: 'Vote is required!' })
      .max(10, { message: 'Vote must be between 1 and 10' })
      .optional(),
    weight: z.number().min(0.1).max(2.0).optional(),
    isReferral: z.boolean().optional(),
  })
  .refine((data) => data.rating || data.weight || data.isReferral, {
    message: 'At least one field must be provided for update',
  });

export const updateUserSchema = z.object({
  name: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email address'),

  username: z.string().min(3, 'Username must be at least 3 characters'),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.coerce.date(),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().max(250, 'Bio must not exceed 250 characters'),
  sexualOrientation: z.nativeEnum(SexualOrientation),
});
export const updateUserPicSchema = z.object({
  image: z.string().url('Must be a valid image URL'),
});

export const reportSchema = z.object({
  reason: z.string().min(1, {
    message: 'Reason is required',
  }),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  additionalInfo: z.string().optional(),
});

export const transactionSchema = z.object({
  amount: z.number(),
  description: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  method: z.nativeEnum(AvailablePayoutMethods),
  identifier: z.string().optional(),
});

export const tipSchema = z.object({
  amount: z
    .number()
    .transform((val) => Number(val))
    .refine((val) => val > 0, {
      message: 'Amount must be greater than 0',
    }),
});

export const addPayoutMethodSchema = z.object({
  method: z.nativeEnum(AvailablePayoutMethods),
  identifier: z.string().min(1, { message: 'Identifier is required' }),
});

export const updateUserSettingsSchema = z
  .object({
    anonymous: z.boolean(),
    sent_email_notifications: z.boolean(),
  })
  .partial();

export const ContactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  inquiryType: z.nativeEnum(InquiryType,
    {
      required_error: 'Please select an inquiry type',
    }
  ),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
