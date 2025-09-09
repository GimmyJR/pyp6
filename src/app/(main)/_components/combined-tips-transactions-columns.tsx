'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/user-avatar';
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import { DateToString } from '@/types/helper';
import { Post, Tip, Transactions, User } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import Link from 'next/link';

// Type definitions
type TipWithRelations = DateToString<
  Tip & {
    creator: User;
    user: User;
    post: Post;
  }
>;

type TransactionWithStringDates = DateToString<Transactions>;

// Define a discriminated union type that properly handles both types
type CombinedItem =
  | (TransactionWithStringDates & { itemType: 'transaction' })
  | (TipWithRelations & { itemType: 'tip' });

export const combinedColumns: ColumnDef<CombinedItem>[] = [
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
    accessorKey: 'type',
    header: () => <div className='text-tertiary'>Action</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'transaction') {
        return (
          <Badge variant={item.type === 'DEPOSIT' ? 'default' : 'secondary'}>
            {item.type}
          </Badge>
        );
      }

      // Empty for tips
      return null;
    },
    filterFn: (row, id, value) => {
      const item = row.original;
      if (item.itemType === 'tip') return false;
      return value === 'all' ? true : item.type === value;
    },
  },
  {
    accessorKey: 'status',
    header: () => <div className='text-tertiary'>Status</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'transaction') {
        const status = item.status as string;
        return (
          <Badge
            variant={
              status === 'COMPLETED'
                ? 'default'
                : status === 'PENDING'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      }

      // Empty for tips
      return null;
    },
    filterFn: (row, id, value) => {
      const item = row.original;
      if (item.itemType === 'tip') return false;
      return value === 'all' ? true : item.status === value;
    },
  },
  {
    accessorKey: 'user',
    header: () => <div className='text-tertiary'>Tipper</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'tip') {
        const user = item.user;

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
      }

      // Empty for transactions
      return null;
    },
  },
  {
    accessorKey: 'creator',
    header: () => <div className='text-tertiary'>Creator</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'tip') {
        const creator = item.creator;
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
      }

      // Empty for transactions
      return null;
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-tertiary'>Amount</div>,
    cell: ({ row }) => {
      const item = row.original;
      const amount = item.amount as number;
      const formatted = formatCurrency(convertAmountFromMiliunits(amount));

      if (item.itemType === 'tip') {
        return <div className='font-medium'>{formatted}</div>;
      }

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: 'commission',
    header: () => <div className='text-tertiary'>Commission</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'transaction') {
        const commissionAmount = item.commissionAmount as number | null;
        const commissionPercent = item.commissionPercent as number | null;

        if (!commissionAmount || !commissionPercent || commissionAmount <= 0) {
          return (
            <div className='text-muted-foreground text-sm'>No commission</div>
          );
        }

        const formattedAmount = formatCurrency(
          convertAmountFromMiliunits(commissionAmount)
        );
        return (
          <div className='space-y-1'>
            <div className='font-medium'>{formattedAmount}</div>
            <div className='text-sm text-muted-foreground'>
              {commissionPercent.toFixed(1)}%
            </div>
          </div>
        );
      }

      // Empty for tips
      return null;
    },
  },
  {
    accessorKey: 'post',
    header: () => <div className='text-tertiary'>Post</div>,
    cell: ({ row }) => {
      const item = row.original;

      if (item.itemType === 'tip') {
        const post = item.post;
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
      }

      // Empty for transactions
      return null;
    },
  },
];

/**
 * Combines transactions and tips into a single array with type discrimination
 * and sorts them by createdAt in descending order
 */
export function combineTransactionsAndTips(
  transactions: TransactionWithStringDates[],
  tips: TipWithRelations[]
): CombinedItem[] {
  const typedTransactions: CombinedItem[] = transactions.map((transaction) => ({
    ...transaction,
    itemType: 'transaction' as const,
  }));

  const typedTips: CombinedItem[] = tips.map((tip) => ({
    ...tip,
    itemType: 'tip' as const,
  }));

  // Combine arrays and sort by createdAt in descending order
  return [...typedTransactions, ...typedTips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
