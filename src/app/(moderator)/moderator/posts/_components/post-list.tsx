'use client';

import { useChangePostStatus } from '@/app/(moderator)/_api/use-change-post-status';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateToString } from '@/types/helper';
import { Post, User } from '@prisma/client';
import Image from 'next/image';

type PostWithCreator = DateToString<Post> & { creator: DateToString<User> };

export default function ModeratorPostList({
  posts,
}: {
  posts: PostWithCreator[];
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: PostWithCreator }) {
  const { mutate, isPending } = useChangePostStatus(post.id);

  const handleChange = (status: 'PENDING' | 'REJECTED') => {
    mutate({ approvalStatus: status });
  };

  return (
    <Card key={post.id} className='flex flex-col'>
      <CardHeader>
        <CardTitle>{post.creator.name}</CardTitle>
        <p className='text-sm text-muted-foreground'>
          {post.createdAt.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className='flex-grow'>
        <div className='mb-4 aspect-square relative'>
          <Image
            src={post.image || '/placeholder.svg'}
            alt='Post image'
            fill
            className='rounded-md object-cover'
          />
        </div>
        <p className='mb-2'>{post.caption}</p>
        {post.tags && (
          <p className='text-sm text-blue-500'>Tags: {post.tags}</p>
        )}
      </CardContent>
      <CardFooter className='flex flex-col space-y-2'>
        <Select
          disabled={isPending}
          onValueChange={handleChange}
          defaultValue={post.approvalStatus}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='REJECTED'>Reject</SelectItem>
            <SelectItem value='PENDING'>Pending</SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}
