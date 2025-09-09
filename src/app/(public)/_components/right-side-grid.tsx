'use client';

import { Card, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetPost } from '../_api/use-get-post';
import { useGetTopUsers } from '../_api/use-get-top-users';
import { usePosts } from '../_hooks/post-context';
import { useActivePostIndex } from '../_hooks/use-active-post-index';

const RightSideGrid = () => {
  const user = useCurrentUser();

  const { posts } = usePosts();

  const { index } = useActivePostIndex();

  const { data: prevActivePost, isLoading } = useGetPost(
    posts?.[index - 1]?.id
  );

  const hasVoted = prevActivePost?.vote.find(
    (vote) => vote.voterId === user?.id || vote.ipAddress === user?.ipAddress
  );

  return (
    <div className='space-y-4'>
      <Card className='rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl space-y-4'>
        {prevActivePost && !!hasVoted && (
          <>
            <CardTitle className='text-base font-normal'>
              {`Check ${prevActivePost.creator.name}’s rate score`}
            </CardTitle>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Image
                  src={prevActivePost.image}
                  alt={prevActivePost.caption ?? `Post`}
                  className='object-cover w-full h-full rounded-3xl border-2 border-white/20'
                  width={123}
                  height={163}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>
              <div className='flex flex-col text-center'>
                <h3 className='text-sm text-white/80 font-bold'>
                  Official Rating
                </h3>
                <p className='text-xs text-white/60'>
                  Based on {prevActivePost._count.vote} votes
                </p>
                <span className='text-6xl font-bold text-[#DA0F3F]'>
                  {prevActivePost.averageRating.toFixed(1)}
                </span>
                <div>
                  <span className='text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full'>
                    you rated: {hasVoted.rating}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        <TopUsers />
      </Card>
    </div>
  );
};

export default RightSideGrid;

const formatNumber = (number: number) => {
  return number < 10 ? `0${number}` : number.toString();
};

function TopUsers() {
  const { data } = useGetTopUsers();

  if (!data) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <>
      <CardTitle className='text-base font-normal'>
        Top {data.length} Users of the day
      </CardTitle>
      <div className='space-y-4'>
        {data.map((post, idx) => (
          <div
            key={post.id}
            className='relative aspect-[1/1.5] overflow-hidden rounded-3xl'
          >
            <Link href={`/?id=${post.id}`}>
              <Image
                src={post.image}
                alt={post.caption ?? `Post ${idx + 1}`}
                className={
                  'object-cover w-full h-full rounded-3xl border-2 border-white/20'
                }
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
            </Link>
            <span
              className='absolute top-2 left-2 z-50 text-7xl font-medium text-transparent'
              style={{
                WebkitTextStrokeWidth: '1.5px',
                WebkitTextStrokeColor: '#FFF',
              }}
            >
              {formatNumber(idx + 1)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
