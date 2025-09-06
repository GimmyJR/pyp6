import { useGetMilestones } from '../_api/use-get-milestones';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EllipseIcon, MedalAchievedIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const MilestonesCard = () => {
  const { data, isLoading } = useGetMilestones();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  const milestones = [
    ...(data?.achieved.milestones || []),
    ...(data?.remaining.milestones.map((_) => ({
      ..._,
      achievedAt: null,
    })) || []),
  ];

  return (
    <Card className='border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
      <CardHeader className='lg:flex-row lg:justify-between lg:items-center'>
        <CardTitle>Gamification & Rewards</CardTitle>
        <CardDescription className='text-sm text-tertiary'>
          Milestones Achieved
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              'flex items-center justify-between rounded-full text-start px-5 py-4',
              !!milestone.achievedAt
                ? 'bg-tertiary text-tertiary-foreground'
                : 'bg-white/10 backdrop-blur-lg text-white'
            )}
          >
            <p className='font-semibold'>{milestone.name}</p>
            {!!milestone.achievedAt ? (
              <MedalAchievedIcon size={24} />
            ) : (
              <EllipseIcon size={24} />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MilestonesCard;
