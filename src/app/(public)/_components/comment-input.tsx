'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import UserAvatar from '@/components/user-avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SendIcon } from '@/icons';
import { commentSchema } from '@/schemas';
import { useEffect } from 'react';
import { useCreateComment } from '../_api/use-create-comment';

const formSchema = commentSchema;

export function CommentInput({ postId }: { postId?: string }) {
  const { mutate, isPending } = useCreateComment(postId);
  const user = useCurrentUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  useEffect(() => {
    form.reset();
  }, [postId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='comment'
          render={({ field }) => (
            <FormItem className='border-2 border-white/20 rounded-full pl-3 pr-4 py-2 space-y-0'>
              <div className='flex items-center justify-between'>
                <UserAvatar src={user?.image} name={user?.name} />
                <FormControl>
                  <Input
                    placeholder='Leave a comment'
                    disabled={isPending || !postId}
                    className='border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base'
                    {...field}
                  />
                </FormControl>
                <button type='submit' className='cursor-pointer'>
                  <SendIcon className='size-8' />
                </button>
              </div>
              <div className="p-1 text-centers">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

