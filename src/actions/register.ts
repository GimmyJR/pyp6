// src/actions/register.ts
'use server';

import * as z from 'zod';
import { hashPassword } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { signIn } from 'next-auth/react';
import { RegisterSchema } from '@/schemas';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, username } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) return { error: 'Email already in use!' };

  try {
    const hashedPassword = await hashPassword(password);

    await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Optional: automatically sign in after registration
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      return { success: 'Account created! Please sign in.' };
    }
    return { success: 'Account created and signed in!' };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return { error: `Duplicate field: ${error.meta?.target}` };
    }
    return { error: 'Something went wrong!' };
  }
};
