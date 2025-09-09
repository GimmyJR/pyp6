'use client';

import { Badge } from '@/components/ui/badge';
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import { DateToString } from '@/types/helper';
import { Transactions } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const columns: ColumnDef<DateToString<Transactions>>[] = [
  {
    accessorKey: 'createdAt',
    header: () => <div className='text-tertiary'>Date</div>,
    cell: ({ row }) => {
      return format(row.getValue('createdAt'), 'dd MMM yy');
    },
  },
  {
    accessorKey: 'type',
    header: () => <div className='text-tertiary'>Action</div>,

    cell: ({ row }) => (
      <Badge
        variant={row.getValue('type') === 'DEPOSIT' ? 'default' : 'secondary'}
      >
        {row.getValue('type')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value === 'all' ? true : row.getValue(id) === value;
    },
  },
  {
    accessorKey: 'status',
    header: () => <div className='text-tertiary'>Status</div>,

    cell: ({ row }) => {
      const status = row.getValue('status') as string;
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
    },
    filterFn: (row, id, value) => {
      return value === 'all' ? true : row.getValue(id) === value;
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-tertiary'>Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      const formatted = formatCurrency(convertAmountFromMiliunits(amount));

      return <div>{formatted}</div>;
    },
  },
];
