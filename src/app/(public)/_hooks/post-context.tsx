'use client';

import { updateShareCount } from '@/actions/update-share-count';
import { PostWithRelations } from '@/types';
import { Gender } from '@prisma/client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { z } from 'zod';
import { useGetPosts } from '../_api/use-get-posts';
import { useQueryParams } from './use-query-params';

interface PostsContextValue {
  posts: PostWithRelations[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefetching: boolean;
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

const schema = z.nativeEnum(Gender);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { getQueryParam, removeQueryParam } = useQueryParams();

  let preference = getQueryParam('preference') as Gender | undefined;

  const id = getQueryParam('id') || undefined;

  if (!schema.safeParse(preference).success) {
    preference = undefined;
  }

  useEffect(() => {
    const shared = getQueryParam('shared') || undefined;

    if (id && shared) {
      updateShareCount(id, 1).finally(() => {
        // Defer to next event loop so metadata is preserved
        setTimeout(() => {
          removeQueryParam('shared');
        }, 300); // or longer if needed
      });
    }
  }, [getQueryParam, id, removeQueryParam]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useGetPosts(preference, id);

  // This effect will run whenever preference changes
  useEffect(() => {
    refetch();
  }, [preference, refetch, id]);

  // Flatten all pages into a single posts array
  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const value = {
    posts,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  };

  console.log({ hasNextPage });

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
