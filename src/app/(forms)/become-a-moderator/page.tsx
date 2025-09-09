import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import BecomeAModeratorForm from '../_components/become-a-moderator-form';

export default function BecomeAModeratorPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-full max-w-3xl rounded-3xl border-2 border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl'>
        <CardHeader>
          <CardTitle>Become a Moderator</CardTitle>
          <CardDescription>
            Help us build a positive and thriving community.
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
            <BecomeAModeratorForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
