import Logo from '@/components/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import SignupForm from '../_components/form/sign-up-form';

export default function SignUpPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <Logo className='text-4xl' />{' '}
      <Card className='w-full max-w-5xl rounded-3xl border-2 border-white/10 bg-white/[0.03] backdrop-blur-xl'>
        <CardHeader>
          <CardTitle>Signup</CardTitle>
          <CardDescription>
            Please upload your image and enter your details to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className='flex items-center justify-center'>
                <Loader2 className='size-4 animate-spin text-muted-foreground' />
              </div>
            }
          >
            <SignupForm />
          </Suspense>
        </CardContent>

        <CardFooter className='justify-center'>
          <p>
            Already have an account?{' '}
            <Link
              href='/auth/sign-in'
              className='text-tertiary hover:underline'
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
