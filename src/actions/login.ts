// actions/login.ts
'use server';

import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { LoginSchema } from '@/schemas';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid credentials!' };
    }

    return { success: 'Signed in successfully!' };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong!' };
  }
};