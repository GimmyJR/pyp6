'use client';

import { useDeleteComment } from '@/app/(moderator)/_api/use-delete-comment';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/hooks/use-confirm';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Trash } from 'lucide-react';

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  commenter: string | null;
};

export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: 'content',
    header: 'Content',
  },
  {
    accessorKey: 'commenter',
    header: 'Commenter',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{format(date, 'dd MMM, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CommentActions comment={row.original} />,
  },
];

const CommentActions: React.FC<{ comment: Comment }> = ({ comment }) => {
  const [ConfirmDialog, confirm] = useConfirm(
    'You are about to delete this comment',
    'Are you sure you want to delete this comment?'
  );
  const { mutate, isPending } = useDeleteComment(comment.id);

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      mutate();
    }
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild className='cursor-pointer'>
            <Button
              variant='destructive'
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash className='size-4' />
              Delete Comment
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
