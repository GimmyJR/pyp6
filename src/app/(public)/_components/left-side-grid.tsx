'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { voteButtonColors } from '@/constants/vote-buttons';
import { QrIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { Gender } from '@prisma/client';
import Link from 'next/link';
import qs from 'query-string';
import { toast } from 'sonner';
import { usePosts } from '../_hooks/post-context';
import { useActivePostIndex } from '../_hooks/use-active-post-index';
import { useQueryParams } from '../_hooks/use-query-params';

const 
LeftSideGrid = () => {
  const { setQueryParam, getQueryParam, removeQueryParam } = useQueryParams();
  const { posts } = usePosts();
  const { index } = useActivePostIndex();

  const activePost = posts[index];
  const preference = getQueryParam('preference');

  // Get the full post URL
  const getPostUrl = () => {
    const url = qs.stringifyUrl({
      url: `${window.location.origin}/`,
      query: {
        id: activePost?.id,
        shared: true,
      },
    });

    return url;
  };

  // Universal share function
  const shareContent = async () => {
    if (!activePost?.id) {
      toast.error('No active post to share');
      return;
    }

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
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
        toast.error('Failed to share content');
      });
  };

  return (
    <div className='space-y-4'>
      <Card className='rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl space-y-4'>
        <div className='space-y-3'>
          <h5 className='text-base text-white/90'>This is how it works!</h5>
          <ol className='text-muted-foreground text-sm list-decimal ml-5 space-y-1'>
            <li>Lorem ipsum dolor sit amet consectetur elit accumsan nec.</li>
            <li>Lorem ipsum dolor sit amet consectetur elit accumsan nec.</li>
            <li>Lorem ipsum dolor sit amet consectetur elit accumsan nec.</li>
          </ol>
        </div>
        <div className='flex flex-wrap justify-around items-center gap-0.5'>
          {voteButtonColors.map((color, i) => (
            <Button
              key={'_voteButtonColors' + i}
              size='icon'
              className='rounded-full size-5 text-xs text-white'
              style={{ background: color }}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </Card>
      <Card className='rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl space-y-4'>
        <CardContent className='p-0 space-y-4'>
          <h5 className='text-base text-white/90'>Preferences</h5>
          <div className='rounded-full bg-white/20 flex items-center justify-between gap-1'>
            {Object.values(Gender).map((item) => (
              <button
                key={item}
                onClick={() => setQueryParam('preference', item)}
                className={cn(
                  'py-2 px-4 flex-1 text-center text-sm capitalize',
                  preference === item && 'bg-white text-black rounded-full'
                )}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => removeQueryParam('preference')}
              className={cn(
                'py-2 px-4 flex-1 text-center text-sm capitalize',
                !preference && 'bg-white text-black rounded-full'
              )}
            >
              BOTH
            </button>
          </div>
        </CardContent>
        <CardContent className='p-0 space-y-4'>
          <h5 className='text-base text-white/90'>Share with friends</h5>
          <div className='flex items-center'>
            <Button
              className='rounded-full px-8 py-2  w-full'
              onClick={shareContent}
              disabled={!activePost?.id}
            >
              Share this post
            </Button>
          </div>
        </CardContent>
        <CardContent className='p-0 space-y-4'>
          <h5 className='text-base text-white/90'>Downloads the app</h5>
          <div className='p-2 border-2 border-white/20 rounded inline-block'>
            <QrIcon />
          </div>
        </CardContent>
        <CardFooter className='p-0 flex-col space-y-2'>
          <div className='flex flex-wrap items-center space-x-1 text-muted-foreground text-xs'>
            <Link href='/about' className='hover:underline'>
              About
            </Link>
            <span>•</span>
            <Link href='/contact' className='hover:underline'>
              Help & Support
            </Link>
            <span>•</span>
            <Link href='/become-a-moderator' className='hover:underline'>
              Join as Moderator{' '}
            </Link>
          </div>
          <div className='flex flex-wrap items-center space-x-1 text-muted-foreground text-xs'>
            <Link href='/terms' className='hover:underline'>
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href='/terms' className='hover:underline'>
              Terms & Conditions
            </Link>
          </div>
          <div className='flex flex-wrap items-center space-x-1 text-muted-foreground text-xs'>
            <span>©2024 Uploto</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LeftSideGrid;
