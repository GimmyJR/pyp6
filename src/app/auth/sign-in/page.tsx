import Logo from '@/components/logo';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import SignInForm from '../_components/form/sign-in-form';

export default function SignInPage() {
  return (
    <div className='flex flex-col min-h-screen items-center justify-center gap-4'>
      <Logo className='text-4xl' />
      <Card className='w-full max-w-md rounded-3xl border-2 border-white/10 bg-white/[0.03] backdrop-blur-xl'>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <Loader2 className='size-4 animate-spin text-muted-foreground' />
            }
          >
            <SignInForm />
          </Suspense>
        </CardContent>

        <CardFooter className='justify-center'>
          <p className='font-space-grotesk'>
            {"Don't have an account?"}{' '}
            <Link
              href='/auth/sign-up'
              className='text-tertiary hover:underline'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
