'use server';

import { hashPassword } from "@/lib/auth-utils";
import * as z from 'zod';
import { RegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, username } = validatedFields.data;

  const hashedPassword = await hashPassword(password);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  try {
    await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Optional: automatically sign in after registration
    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        // If sign-in fails, just return success for registration
        return { success: 'Account created! Please sign in.' };
      }
      throw error;
    }

    return { success: 'Account created!' };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong!' };
  }
}
