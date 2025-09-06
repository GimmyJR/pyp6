import { Skeleton } from '@/components/ui/skeleton';
import UserAvatar from '@/components/user-avatar';
import { DateToString } from '@/types/helper';
import { User, Vote } from '@prisma/client';
import { memo } from 'react';

interface VoterDisplayProps {
  votes: DateToString<
    Vote & {
      voter?: User | null;
    }
  >[];
  maxDisplay?: number;
  className?: string;
  isLoading?: boolean;
}

export const VoterDisplay = memo(
  ({ votes = [], maxDisplay = 3, isLoading }: VoterDisplayProps) => {
    const filteredVotes = votes.filter((vote) => !!vote.voter?.id);

    const displayedVotes = filteredVotes.slice(0, maxDisplay);

    const remainingCount = Math.max(0, votes.length - displayedVotes.length);
    const hasMore = remainingCount > 0;

    if (isLoading) {
      return (
        <div className='flex items-center gap-2'>
          <div className='flex'>
            <div className='flex -space-x-4'>
              {new Array(3).fill(0).map((_, idx) => (
                <div
                  key={idx}
                  className='relative inline-block'
                  style={{
                    zIndex: maxDisplay - idx,
                  }}
                >
                  <Skeleton className='rounded-full w-8 h-8' />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className='w-full h-4' />
        </div>
      );
    }

    if (!filteredVotes.length) return null;

    return (
      <div className='flex items-center gap-2'>
        {/* Avatars */}
        <div className='flex'>
          <div className='flex -space-x-4'>
            {displayedVotes.map((vote, idx) => (
              <div
                key={vote.id}
                className='relative inline-block'
                style={{
                  zIndex: maxDisplay - idx,
                }}
              >
                <UserAvatar
                  src={vote.voter?.image}
                  name={vote.voter?.name}
                  size={20}
                  className='size-8 border-2 border-black'
                />
              </div>
            ))}
          </div>
        </div>

        {/* Names and count */}
        <div className='text-sm text-white'>
          {displayedVotes
            .map((vote) => vote.voter?.name || 'Anonymous')
            .join(', ')}{' '}
          {hasMore &&
            `and ${remainingCount} ${remainingCount === 1 ? 'other' : 'others'}`}{' '}
          rated
        </div>
      </div>
    );
  }
);

VoterDisplay.displayName = 'VoterDisplay';
