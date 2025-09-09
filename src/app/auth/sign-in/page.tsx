// src/app/auth/sign-in/page.tsx
'use client';

import Logo from '@/components/logo';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(result?.url || "/"); // result.url will be "/" because of callbackUrl
    }
    
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4">
      <Logo className="text-4xl" />
      <Card className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" className="p-3 rounded-lg bg-white/10" required />
            <input type="password" name="password" placeholder="Password" className="p-3 rounded-lg bg-white/10" required />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="p-3 rounded-lg bg-tertiary text-white font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Sign In'}
            </button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p>
            {"Don't have an account? "}
            <Link href="/auth/sign-up" className="text-tertiary hover:underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
