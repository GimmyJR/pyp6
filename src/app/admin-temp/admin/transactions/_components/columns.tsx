'use client';

import { useEditTransactionStatus } from '@/app/(admin)/_api/use-edit-transaction-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import { DateToString } from '@/types/helper';
import { Transactions, TransactionStatus, User } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, MoreHorizontal, XCircle } from 'lucide-react';
import { DataTableColumnHeader } from './data-table-column-header';

export const columns: ColumnDef<
  DateToString<
    Transactions & {
      user: User;
    }
  >
>[] = [
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));

      return (
        <div className='font-medium'>
          {formatCurrency(convertAmountFromMiliunits(amount))}
        </div>
      );
    },
  },
  {
    accessorKey: 'commissionAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Commission' />
    ),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('commissionAmount'));

      if (isNaN(amount) || amount <= 0) {
        return (
          <div className='font-medium text-muted-foreground'>No commission</div>
        );
      }

      return (
        <div className='font-medium'>
          {formatCurrency(convertAmountFromMiliunits(amount))}
        </div>
      );
    },
  },
  {
    accessorKey: 'commissionPercent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Commission Percentage' />
    ),
    cell: ({ row }) => {
      const percentage = Number(row.getValue('commissionPercent'));

      if (isNaN(percentage) || percentage <= 0) {
        return (
          <div className='font-medium text-muted-foreground'>No commission</div>
        );
      }

      return <div className='font-medium'>{percentage.toFixed(2)}%</div>;
    },
  },
  {
    accessorFn: (row) => row.user.email, // Access nested property manually
    id: 'user.email', // ID should match the filter column
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User Email' />
    ),
    filterFn: (row, columnId, filterValue) => {
      console.log('Row data:', row.original);
      console.log('Column ID:', columnId);
      console.log('Filter value:', filterValue);

      const value = row.getValue(columnId);
      console.log('Retrieved value:', value);

      if (!value || !filterValue) return true;
      return value.toString().toLowerCase().includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Method' />
    ),
  },
  {
    accessorKey: 'identifier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment identifier' />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => (
      <div className='w-[120px]'>
        {new Date(row.getValue('createdAt')).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const transaction = row.original;

      return <TransactionAction transaction={transaction} />;
    },
  },
];

function TransactionAction({
  transaction,
}: {
  transaction: DateToString<Transactions>;
}) {
  const { mutate, isPending } = useEditTransactionStatus(transaction.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(transaction.id)}
          className='cursor-pointer'
        >
          Copy transaction ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => mutate({ status: TransactionStatus.COMPLETED })}
          className='cursor-pointer'
        >
          <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />
          Mark as completed
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => mutate({ status: TransactionStatus.REJECTED })}
          className='cursor-pointer'
        >
          <XCircle className='mr-2 h-4 w-4 text-red-600' />
          Mark as failed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
