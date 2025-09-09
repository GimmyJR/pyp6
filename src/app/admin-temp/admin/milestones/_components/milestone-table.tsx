'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateToString } from '@/types/helper';
import { Milestone, MilestoneType } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

export function MilestonesTable({
  milestones = [],
}: {
  milestones?: DateToString<Milestone>[];
}) {
  return (
    <div className='border rounded-lg'>
      <Table>
        <TableCaption>A list of all milestones.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[200px]'>Name</TableHead>
            <TableHead className='w-[300px]'>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className='text-right'>Threshold</TableHead>
            <TableHead className='text-right'>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {milestones.map((milestone) => (
            <TableRow key={milestone.id}>
              <TableCell className='font-medium'>{milestone.name}</TableCell>
              <TableCell>{milestone.description}</TableCell>
              <TableCell>
                <MilestoneTypeBadge type={milestone.type} />
              </TableCell>
              <TableCell className='text-right'>
                {milestone.threshold}
              </TableCell>
              <TableCell className='text-right'>
                {formatDistanceToNow(milestone.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MilestoneTypeBadge({ type }: { type: MilestoneType }) {
  const colors: Record<MilestoneType, string> = {
    CASH_OUT:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    EARNINGS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    VOTE_COUNT:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    COMMENT_COUNT:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    PHOTO_COUNT:
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    LOGIN_STREAK:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    VOTING_STREAK:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };

  return (
    <Badge variant='outline' className={`${colors[type]} border-0`}>
      {type.replace(/_/g, ' ')}
    </Badge>
  );
}
