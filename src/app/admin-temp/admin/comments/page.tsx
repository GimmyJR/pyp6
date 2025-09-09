'use client';

import { useGetComments } from '../../_api/use-get-comments';
import { columns } from './_components/colums';
import { CommentsTable } from './_components/comments-table';

export default function CommentsPage() {
  const { data, isLoading } = useGetComments();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Manage Comments</h1>
      <CommentsTable
        columns={columns}
        data={
          data?.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commenter: comment.user.name,
            postId: comment.postId,
          })) ?? []
        }
      />
    </div>
  );
}
