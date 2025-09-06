import { cookies } from 'next/headers';

// Constants
export const ANON_VOTES_COOKIE_NAME = 'anonymousVotes';
export const DAILY_VOTE_LIMIT = 10; // Maximum anonymous votes per day

export interface AnonymousVoteTracking {
  date: string; // Date in ISO format, we'll use just the date part (YYYY-MM-DD)
  postIds: string[]; // List of post IDs voted on
}

// Function to get current anonymous votes
export function getAnonymousVotes(): AnonymousVoteTracking | null {
  const voteCookie = cookies().get(ANON_VOTES_COOKIE_NAME);
  if (!voteCookie) {
    return null;
  }

  try {
    return JSON.parse(voteCookie.value);
  } catch (error) {
    console.error('Error parsing anonymous votes cookie:', error);
    return null;
  }
}

// Function to save anonymous votes
export function saveAnonymousVote(postId: string): AnonymousVoteTracking {
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
  const existingVotes = getAnonymousVotes();

  // Create new vote tracking or reset if it's a new day
  const currentVotes: AnonymousVoteTracking = 
    !existingVotes || existingVotes.date !== today
      ? { date: today, postIds: [postId] }
      : {
          date: today,
          postIds: [...new Set([...existingVotes.postIds, postId])], // Add unique postId
        };

  // Save to cookie
  cookies().set({
    name: ANON_VOTES_COOKIE_NAME,
    value: JSON.stringify(currentVotes),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: 'lax',
    path: '/',
  });

  return currentVotes;
}

// Function to check if anonymous user has reached vote limit
export function hasReachedDailyVoteLimit(): boolean {
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
  const existingVotes = getAnonymousVotes();

  // If no votes or from a previous day, they haven't reached the limit
  if (!existingVotes || existingVotes.date !== today) {
    return false;
  }

  return existingVotes.postIds.length >= DAILY_VOTE_LIMIT;
}
