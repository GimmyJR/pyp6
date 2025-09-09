'use client';

import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/user-avatar';
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import { DateToString } from '@/types/helper';
import { Post, Tip, User } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import Link from 'next/link';

// Assuming you have a type definition that extends the Tip model with string dates
type TipWithStringDates = DateToString<
  Tip & {
    creator: User;
    user: User;
    post: Post;
  }
>;

export const tipColumns: ColumnDef<TipWithStringDates>[] = [
  {
    accessorKey: 'createdAt',
    header: () => <div className='text-tertiary'>Date</div>,
    cell: ({ row }) => {
      return (
        <div className='whitespace-nowrap'>
          {format(row.getValue('createdAt'), 'dd MMM yy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'user',
    header: () => <div className='text-tertiary'>Tipper</div>,
    cell: ({ row }) => {
      const user = row.getValue('user') as TipWithStringDates['user'];

      if (user.anonymous) {
        return (
          <div className='flex items-center gap-2'>
            <UserAvatar name={'A'} />
            <span className='truncate'>Anonymous</span>
          </div>
        );
      }

      return (
        <div className='flex items-center gap-2'>
          <UserAvatar className='h-8 w-8' src={user.image} name={user.name} />
          <span className='truncate'>{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'creator',
    header: () => <div className='text-tertiary'>Creator</div>,
    cell: ({ row }) => {
      const creator = row.getValue('creator') as TipWithStringDates['creator'];
      return (
        <div className='flex items-center gap-2'>
          <UserAvatar
            className='h-8 w-8'
            src={creator.image}
            name={creator.name}
          />
          <span className='truncate'>{creator.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-tertiary'>Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      const formatted = formatCurrency(convertAmountFromMiliunits(amount));

      return <div className='font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'post',
    header: () => <div className='text-tertiary'>Post</div>,
    cell: ({ row }) => {
      const post = row.getValue('post') as TipWithStringDates['post'];
      return (
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' asChild>
            <Link
              href={`/?id=${post.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Eye className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
