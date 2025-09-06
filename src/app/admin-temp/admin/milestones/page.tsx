'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useGetMilestones } from '../../_api/use-get-milestones';
import { MilestonesTable } from './_components/milestone-table';
import { useNewMilestone } from './_hooks/use-new-milestone';

export default function MilestonesPage() {
  const { data, isLoading } = useGetMilestones();

  const { onOpen } = useNewMilestone();

  if (isLoading) {
    return <>loading...</>;
  }

  return (
    <div className='container py-10'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Milestones</h1>
        <Button onClick={onOpen}>
          <PlusIcon className='mr-2 h-4 w-4' />
          Add Milestone
        </Button>
      </div>
      <MilestonesTable milestones={data} />
    </div>
  );
}
