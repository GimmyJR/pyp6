'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useGetPosts } from '../../_api/use-get-posts';
import ModeratorFilters from './_components/filters';
import ModeratorPostList from './_components/post-list';

function PostsContent() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetPosts();

  const posts = data || [];

  const search = searchParams.get('search');
  const status = searchParams.get('status') || 'ALL';

  const filteredPosts = posts?.filter((post) => {
    if (search) {
      if (!post.caption?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
    }

    if (status && status !== 'ALL') {
      if (post.approvalStatus !== status) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Manage Posts</h1>
      <ModeratorFilters />
      <ModeratorPostList posts={filteredPosts} />
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostsContent />
    </Suspense>
  );
}
