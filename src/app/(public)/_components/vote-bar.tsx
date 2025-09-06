import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { voteButtonColors } from '@/constants/vote-buttons';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useGetPost } from '../_api/use-get-post';
import { useVotePost } from '../_api/use-vote-post';
import { usePosts } from '../_hooks/post-context';
import { useSwiper } from '../_hooks/swiper-context';
import { useActivePostIndex } from '../_hooks/use-active-post-index';

const VoteBar = () => {
  const user = useCurrentUser();

  const { posts } = usePosts();

  const { swiperRef } = useSwiper();

  const { index: activePostIndex } = useActivePostIndex();

  const { data: activePost, isLoading } = useGetPost(
    posts?.[activePostIndex].id
  );

  const { mutate: votePost, isPending: isVoting } = useVotePost(activePost?.id);

  if (isLoading) {
    return (
      <div className='flex flex-wrap items-center justify-around gap-0.5'>
        {voteButtonColors.map((_, i) => (
          <Skeleton
            key={`loading-vote-button-${i}`}
            className='size-5 lg:size-7 rounded-full'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-center justify-around gap-0.5'>
      {voteButtonColors.map((color, i) => (
        <Button
          disabled={isVoting}
          onClick={() => {
            votePost(
              {
                rating: i + 1,
              },
              {
                onSuccess: () => {
                  swiperRef.current?.swiper.slideNext();
                },
              }
            );
          }}
          key={`vote-button-${activePost?.id}-${i}`}
          size='icon'
          className={`border border-white/10 bg-transparent backdrop-blur-xl rounded-full text-xs lg:text-sm size-5 lg:size-7 text-white p-1 cursor-pointer`}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          style={
            activePost?.vote.find(
              (vote) =>
                vote.voterId === user?.id || vote.ipAddress === user?.ipAddress
            )?.rating ===
            i + 1
              ? {
                  background: color,
                  border: '2px solid white',
                }
              : {}
          }
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
};

export default VoteBar;
