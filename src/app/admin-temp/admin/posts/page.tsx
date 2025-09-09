'use client';

import { useGetPosts } from '../../_api/use-get-posts';
import { PostsTable } from './_components/table';

export default function PostsPage() {
  const { data = [], isLoading } = useGetPosts();

  if (isLoading) {
    return <>loading...</>;
  }


  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Posts Management</h1>
      </div>
      <div>
        <PostsTable posts={data} />
      </div>
    </div>
  );
}
