'use client';

import { Check, Clock, Eye, MoreHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useChangePostStatus } from '@/app/(admin)/_api/use-change-post-status';
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
import { ApprovalStatus, Post, User } from '@prisma/client';

interface PostActionsProps {
  post: DateToString<
    Post & {
      creator: User;
    }
  >;
}

export function PostActions({ post }: PostActionsProps) {
  const router = useRouter();

  const { mutate, isPending } = useChangePostStatus(post.id);

  const handleChange = (status: keyof typeof ApprovalStatus) => {
    mutate({ approvalStatus: status });
  };

  const viewPost = () => {
    // In a real app, this would navigate to a post detail view
    router.push(`/admin/posts?id=${post.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem disabled={isPending} onClick={viewPost}>
            <Eye className='mr-2 h-4 w-4' />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleChange('APPROVED')}
            disabled={isPending || post.approvalStatus === 'APPROVED'}
          >
            <Check className='mr-2 h-4 w-4 text-green-500' />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleChange('REJECTED')}
            disabled={isPending || post.approvalStatus === 'REJECTED'}
          >
            <X className='mr-2 h-4 w-4 text-red-500' />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleChange('PENDING')}
            disabled={isPending || post.approvalStatus === 'PENDING'}
          >
            <Clock className='mr-2 h-4 w-4 text-yellow-500' />
            Mark as pending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

