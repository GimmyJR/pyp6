'use client';

import { useUpdateContactRequestStatus } from '@/app/(admin)/_api/use-update-contact-request-status';
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
import { DateToString } from '@/types/helper';
import { ApprovalStatus, Contact, InquiryType } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, MoreHorizontal, X } from 'lucide-react';

export const columns: ColumnDef<DateToString<Contact>>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string;
      return <div className='font-medium'>{id.substring(0, 8)}...</div>;
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div>
          {firstName} {lastName}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'inquiryType',
    header: 'Inquiry Type',
    cell: ({ row }) => {
      const inquiryType = row.getValue('inquiryType') as InquiryType;
      return <div>{inquiryType}</div>;
    },
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ApprovalStatus;

      return (
        <Badge
          className={
            status === ApprovalStatus.APPROVED
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : status === ApprovalStatus.REJECTED
                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <div>{format(new Date(date), 'dd MMM yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contact = row.original;

      return <Actions contact={contact} />;
    },
  },
];

function Actions({ contact }: { contact: DateToString<Contact> }) {
  const { mutate, isPending } = useUpdateContactRequestStatus(contact.id);

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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(contact.id)}
        >
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.alert(
              `View details for ${contact.firstName} ${contact.lastName}`
            )
          }
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => {
            mutate({ status: 'APPROVED' });
          }}
          className='flex items-center gap-2 text-green-600'
        >
          <Check className='h-4 w-4' /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => {
            mutate({ status: 'REJECTED' });
          }}
          className='flex items-center gap-2 text-red-600'
        >
          <X className='h-4 w-4' /> Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
