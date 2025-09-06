import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/hooks/use-confirm';
import { RatingIcon, ShareIcon, UpVoteIcon } from '@/icons';
import { DateToString } from '@/types/helper';
import { Post } from '@prisma/client';
import { Share2, StarIcon, Trash } from 'lucide-react';
import Image from 'next/image';
import qs from 'query-string';
import { toast } from 'sonner';
import { useDeletePost } from '../_api/use-delete-post';

const PostCard = ({
  post,
}: {
  post: DateToString<
    Post & {
      _count: {
        vote: number;
      };
    }
  >;
}) => {
  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure?',
    'You are about to delete this post'
  );

  const { mutate, isPending } = useDeletePost(post.id);

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      mutate();
    }
  };

  // Get the post URL
  const getPostUrl = () => {
    const url = qs.stringifyUrl({
      url: `${window.location.origin}/`,
      query: {
        id: post.id,
        shared: true,
      },
    });

    return url;
  };

  // Share function
  const shareContent = async () => {
    const url = getPostUrl();
    const title = 'Check out this post!';
    const text = 'I thought you might like this';

    // Try to use the Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        toast.success('Shared successfully');
        return;
      } catch (err) {
        const error = err as Error;
        // If user cancelled or sharing failed, fall back to clipboard
        if (error.name !== 'AbortError') {
          console.warn(
            'Native sharing failed, falling back to clipboard',
            error
          );
        }
      }
    }

    // Fallback to clipboard if Web Share API is not available or failed
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Link copied to clipboard');
        // Update share count logic would go here
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
        toast.error('Failed to share content');
      });
  };

  return (
    <>
      <ConfirmDialog />
      <div
        key={post.id}
        className='rounded-xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl space-y-2'
      >
        <div className='relative aspect-square'>
          <Image
            src={post.image}
            alt={post.caption || 'user post'}
            className='rounded-sm object-cover'
            fill
          />
          <div className='absolute bottom-2 left-2 z-20 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1'>
            <StarIcon className='text-tertiary fill-tertiary' size={14} />
            <span className='text-white text-sm font-medium'>
              {post.averageRating.toFixed(1)}
            </span>
          </div>
          <div className='absolute top-1 right-1 z-20'>
            <Badge
              variant={
                post.approvalStatus === 'APPROVED'
                  ? 'success'
                  : post.approvalStatus === 'REJECTED'
                    ? 'destructive'
                    : 'outline'
              }
              className='capitalize'
            >
              {post.approvalStatus}
            </Badge>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <RatingIcon className='fill-tertiary' size={18} />{' '}
              {post.impressions}
            </div>
            <div className='flex items-center gap-1'>
              <UpVoteIcon className='fill-green-500' size={18} />{' '}
              {post._count.vote}
            </div>
            <div className='flex items-center gap-1'>
              <ShareIcon className='fill-white' size={18} /> {post.sharesCount}
            </div>
          </div>
          <div className='flex items-center'>
            <Button
              size='icon'
              onClick={shareContent}
              variant='ghost'
              className='text-blue-400 hover:text-white hover:bg-transparent size-6'
            >
              <Share2 size={20} />
            </Button>
            <Button
              size='icon'
              disabled={isPending}
              onClick={handleDelete}
              variant='ghost'
              className='text-rose-600 hover:text-white hover:bg-transparent size-6'
            >
              <Trash size={20} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;
