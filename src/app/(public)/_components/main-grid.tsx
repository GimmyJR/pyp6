'use client';

import { useGetUserProfile } from '@/app/(main)/_api/use-get-user-profile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { usePosts } from '../_hooks/post-context';
import { useSwiper } from '../_hooks/swiper-context';
import { useActivePostIndex } from '../_hooks/use-active-post-index';
import { useQueryParams } from '../_hooks/use-query-params';
import CommentBox from './comment-box';
import { CommentInput } from './comment-input';
import ReportDialog from './report-dialog';
import TipDialog from './tip-dialog';
import VoteBar from './vote-bar';
import { VoterDisplay } from './voter-list';

const MainGrid = () => {
  const {
    posts,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
  } = usePosts();

  const { data: profile } = useGetUserProfile();

  const { removeQueryParam } = useQueryParams();

  const { swiperRef, handleSwiper } = useSwiper();

  const { index: activePostIndex, setIndex: setActivePostIndex } =
    useActivePostIndex();

  const activePost = posts?.[activePostIndex];

  const handleSlideChange = () => {
    if (swiperRef.current && posts?.length) {
      const currentIndex = swiperRef.current.swiper.activeIndex;
      setActivePostIndex(currentIndex);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!swiperRef.current) return;

    const swiper = swiperRef.current.swiper;
    const timeToFetchNextPosts = swiper.activeIndex >= swiper.slides.length - 5;

    removeQueryParam('id');

    // Handle next navigation and data fetching
    if (direction === 'next') {
      // Prefetch next page when user reaches second to last slide
      if (timeToFetchNextPosts && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
      swiper.slideNext();
    }
    // Handle previous navigation
    else if (direction === 'prev') {
      swiper.slidePrev();
    }
  };

  if (isLoading || isRefetching) {
    return <MainGridSkeleton />;
  }

  if (!posts || posts.length === 0) {
    return <div className='text-center'>No posts available</div>;
  }

  return (
    <div className='relative flex flex-col items-center justify-center space-y-4 p-4 min-h-screen'>
      <div className='pt-8 lg:p-0'>
        <h2 className='text-4xl md:text-5xl font-caveat text-center'>
          Rate{' '}
          <span className='font-bold'>
            {activePost?.creator.username ||
              activePost?.creator.name ||
              'Creator'}
          </span>
        </h2>
      </div>

      <ReportDialog postId={activePost?.id} />

      <div className='max-w-3xl w-full mx-auto relative'>
        <Swiper
          ref={swiperRef}
          onSwiper={handleSwiper}
          modules={[Navigation]}
          slidesPerView={1}
          centeredSlides={true}
          spaceBetween={0}
          onSlideChange={handleSlideChange}
          className='relative overflow-visible'
          breakpoints={{
            1024: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
          }}
        >
          {posts.map((post, idx) => (
            <SwiperSlide
              key={post.id}
              className={cn(
                'relative group',
                activePostIndex === idx ? 'z-30 !h-auto' : '!h-[75%] my-auto'
              )}
            >
              {({ isActive, isNext, isPrev }) => (
                <div
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-3xl',
                    'flex justify-center items-center transition-all duration-300',
                    isActive ? 'scale-100' : 'scale-[0.75]',
                    isNext && '-translate-x-1/2',
                    isPrev && 'translate-x-1/2'
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-black/50 z-10 rounded-3xl',
                      'transition-opacity duration-300',
                      isActive ? 'opacity-0' : 'opacity-100'
                    )}
                  />

                  <Image
                    src={post.image}
                    alt={post.caption ?? `Post ${idx + 1}`}
                    className={cn(
                      'object-cover w-full h-full rounded-3xl',
                      'transition-all duration-300',
                      isActive ? 'opacity-100' : 'opacity-50'
                    )}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    priority={true}
                  />

                  {isActive && (
                    <div className='absolute bottom-4 left-4 right-4 z-20 border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl rounded-full text-white'>
                      <VoteBar />
                    </div>
                  )}
                </div>
              )}
            </SwiperSlide>
          ))}
          {isFetchingNextPage && (
            <SwiperSlide
              className={cn(
                'relative group',
                activePostIndex === posts.length
                  ? 'z-30 !h-auto'
                  : '!h-[75%] my-auto'
              )}
            >
              {({ isActive, isNext, isPrev }) => (
                <Skeleton
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-3xl',
                    'flex justify-center items-center',
                    isActive ? 'scale-100' : 'scale-[0.75]',
                    isNext && '-translate-x-1/2',
                    isPrev && 'translate-x-1/2'
                  )}
                />
              )}
            </SwiperSlide>
          )}
          {!hasNextPage && (
            <SwiperSlide
              className={cn(
                'relative group',
                activePostIndex === posts.length
                  ? 'z-30 !h-auto'
                  : '!h-[75%] my-auto'
              )}
            >
              {({ isActive, isNext, isPrev }) => (
                <div
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-3xl',
                    'flex justify-center items-center transition-all duration-300',
                    isActive ? 'scale-100' : 'scale-[0.75]',
                    isNext && '-translate-x-1/2',
                    isPrev && 'translate-x-1/2'
                  )}
                >
                  <Image
                    src={'/images/no-more-posts.jpeg'}
                    alt={'No more posts'}
                    className={cn(
                      'object-cover w-full h-full rounded-3xl',
                      'transition-all duration-300',
                      isActive ? 'opacity-100' : 'opacity-50'
                    )}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                </div>
              )}
            </SwiperSlide>
          )}
        </Swiper>

        <Button
          onClick={() => handleNavigation('prev')}
          size='icon'
          aria-label='Previous slide'
          className='absolute top-1/2 left-2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/10 rounded-full p-1 hover:bg-white/20 border-2 border-white/20 transition-colors'
        >
          <ChevronLeft className='size-6 text-white' />
        </Button>
        <Button
          onClick={() => handleNavigation('next')}
          size='icon'
          aria-label='Next slide'
          className='absolute top-1/2 right-2 translate-x-1/2 -translate-y-1/2 z-20 bg-white/10 rounded-full p-1 hover:bg-white/20 border-2 border-white/20 transition-colors'
        >
          <ChevronRight className='size-6 text-white' />
        </Button>
      </div>

      <div className='max-w-sm mx-auto space-y-4'>
        <VoterDisplay votes={activePost?.vote || []} maxDisplay={3} />
        <PostCaption caption={activePost?.caption ?? undefined} />
        <CommentBox postId={activePost?.id} />
        <div className='flex items-center gap-2'>
          <CommentInput postId={activePost?.id} />
          <TipDialog
            postId={activePost?.id}
            userBalance={profile?.balance || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default MainGrid;

export const MainGridSkeleton = () => {
  return (
    <div className='relative'>
      <div className='flex flex-col items-center justify-center min-h-screen space-y-4'>
        <div className='flex justify-center items-center space-x-4'>
          <Skeleton className='w-64 h-64 rounded-3xl opacity-50 translate-x-1/3' />
          <Skeleton className='w-80 h-80 rounded-3xl z-10' />
          <Skeleton className='w-64 h-64 rounded-3xl opacity-50 -translate-x-1/3' />
        </div>
      </div>

      {/* Navigation Buttons */}
      <Skeleton className='absolute top-1/2 left-0 translate-x-1/2 -translate-y-1/2 z-20 size-10 rounded-full' />
      <Skeleton className='absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 z-20 size-10 rounded-full' />

      {/* Report Button */}
      <Skeleton className='absolute top-0 right-4 w-48 h-9' />
    </div>
  );
};

const PostCaption = ({
  caption,
  isLoading,
}: {
  caption?: string;
  isLoading?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  if (isLoading) {
    return <Skeleton className='w-full h-4 rounded-3xl' />;
  }

  if (!caption) {
    return null;
  }

  return (
    <div className='text-sm text-white/90'>
      {isExpanded ? caption : `${caption.slice(0, 100)}...`}
      {caption.length > 100 && (
        <button
          onClick={toggleExpanded}
          className='text-xs text-blue-500 hover:underline ml-2'
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};
