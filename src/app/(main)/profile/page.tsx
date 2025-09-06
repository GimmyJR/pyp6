'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { VerifiedIcon } from '@/icons';
import { CircleFadingPlus, Loader2, Settings } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useGetNextMilestone } from '../_api/use-get-next-milestone';
import { useGetUserPosts } from '../_api/use-get-user-posts';
import { useGetUserProfile } from '../_api/use-get-user-profile';
import EditProfilePic from '../_components/edit-profile-pic';
import EmptyScreen from '../_components/empty-screen';
import PostCard from '../_components/post-card';
import { useNewPost } from '../_hooks/use-new-post';
import { useOpenProfile } from '../_hooks/use-open-profile';
import { useOpenSettings } from '../_hooks/use-open-settings';

export default function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useGetUserProfile();

  const { onOpen: onNewPostOpen } = useNewPost();
  const { onOpen: onProfileOpen } = useOpenProfile();
  const { onOpen: onSettingsOpen } = useOpenSettings();

  if (isUserLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  return (
    <div className='px-4 py-6 sm:px-6 sm:py-8 space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col lg:flex-row items-center gap-4'>
          <EditProfilePic user={user} />
          <div className='space-y-2'>
            <div className='flex items-center justify-center lg:justify-start gap-1'>
              <h5 className='text-white text-2xl font-bold'>{user.name}</h5>
              <VerifiedIcon />
            </div>
            <p className='text-muted-foreground text-center lg:text-left'>
              {`Your uploads are better than ${user.stats.percentileStat || 0}% of users.`}
            </p>
            <div className='flex flex-col lg:flex-row items-center gap-2'>
              <Button
                onClick={onProfileOpen}
                variant='tertiary'
                className='w-full lg:w-auto'
              >
                Edit Profile
              </Button>
              <Button
                onClick={onNewPostOpen}
                variant='quaternary'
                className='w-full lg:w-auto'
              >
                <CircleFadingPlus />
                Upload Photo
              </Button>
              <Button
                onClick={() =>
                  onSettingsOpen({
                    anonymous: user.anonymous,
                    sent_email_notifications: user.sent_email_notifications,
                  })
                }
                variant='quaternary'
                className='w-full lg:w-auto'
              >
                <Settings />
                Settings
              </Button>
            </div>
          </div>
        </div>
        <div className='max-w-sm space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex flex-col items-center justify-center'>
              <h6 className='text-white text-2xl font-bold text-center lg:text-left'>
                {user._count?.post}
              </h6>
              <p className='text-muted-foreground text-xs text-center lg:text-left'>
                Photos
              </p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <h6 className='text-white text-2xl font-bold text-center lg:text-left'>
                {user.stats.averageRating.toFixed(2)}
              </h6>
              <p className='text-muted-foreground text-xs text-center lg:text-left'>
                Average Rating
              </p>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <h6 className='text-white text-2xl font-bold text-center lg:text-left'>
                {user.stats.receivedVotes}
              </h6>
              <p className='text-muted-foreground text-xs text-center lg:text-left'>
                Voted Times
              </p>
            </div>
          </div>
          <UserStats />
        </div>
      </div>
      <PostsSection />
    </div>
  );
}

function PostsSection() {
  const { data: posts, isLoading: isPostsLoading } = useGetUserPosts();

  if (isPostsLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {new Array(8).fill(0).map((_, i) => (
          <Skeleton key={i} className='h-96' />
        ))}
      </div>
    );
  }

  if (!posts || posts.length <= 0) {
    return <EmptyScreen />;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function UserStats() {
  const { data, isLoading } = useGetNextMilestone();

  if (isLoading || !data?.nextMilestone) {
    return;
  }

  return (
    <>
      <Slider value={[data.nextMilestone.progress]} showValue disabled />
      <p className='text-muted-foreground text-xs text-center lg:text-left'>
        {data.nextMilestone.description || "You're doing great!"}
      </p>
    </>
  );
}
