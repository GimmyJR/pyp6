import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useGetComments } from '../_api/use-get-comments';

const CommentBox = ({ postId }: { postId?: string }) => {
  const { data, isLoading } = useGetComments(postId);

  const [viewMore, setViewMore] = useState(false);

  if (isLoading) {
    return (
      <div className='w-full space-y-2'>
        <Skeleton className='w-full h-6' />
        <Skeleton className='w-full h-6' />
      </div>
    );
  }

  return (
    <div className='w-full space-y-1'>
      {data?.slice(0, 2).map((comment, idx) => (
        <div key={comment.id} className='text-left flex items-center gap-4'>
          <strong className='text-white text-sm'>{comment.user.name}</strong>
          <p
            className={cn(
              'text-white/80 text-sm',
              !viewMore && data.length > 2 && 'line-clamp-1'
            )}
          >
            {comment.content}
          </p>
          <span
            className='text-blue-500 hover:underline text-sm whitespace-nowrap cursor-pointer'
            onClick={() => setViewMore(true)}
          >
            {idx === 1 && data.length > 2 && !viewMore && 'View more'}
          </span>
        </div>
      ))}
      {viewMore &&
        data?.slice(2).map((comment, idx) => (
          <div key={comment.id} className='text-left flex items-center gap-4'>
            <strong className='text-white text-sm'>{comment.user.name}</strong>
            <p className='text-white/80 text-sm'>{comment.content}</p>
          </div>
        ))}
    </div>
  );
};

export default CommentBox;
