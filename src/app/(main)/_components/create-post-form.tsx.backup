'use client';

import TagInput from '@/components/tag-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioIcon } from '@/icons';
import { useUploadThing } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';
import { PostSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from '@uploadthing/react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';
import { z } from 'zod';
import { useCreatePost } from '../_api/use-create-post';
import { useNewPost } from '../_hooks/use-new-post';

// Extend the schema to include image
const formSchema = PostSchema.extend({
  image: z.custom<File>().refine((files) => !!files, 'Image is required'),
  imagePreview: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePostForm() {
  const { status, onStatusChange } = useNewPost();
  const { createPost, isPending: isMutationPending } = useCreatePost();
  const [isTransitionPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caption: '',
      tags: '',
      image: undefined,
      imagePreview: undefined,
    },
  });

  const { startUpload, routeConfig } = useUploadThing('imageUploader', {
    onUploadError: () => {
      toast.error('Image upload failed!');
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          form.setValue('imagePreview', reader.result as string);
          form.setValue('image', acceptedFiles[0]);
        };
        reader.readAsDataURL(file);
      }
    },
    [form]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      onStatusChange('submitting');
      const uploadedFiles = await startUpload([values.image]);

      if (!uploadedFiles) {
        toast.error('Failed to upload the image!');
        onStatusChange('error');
        return;
      }

      createPost(
        {
          caption: values.caption,
          tags: values.tags,
          image: uploadedFiles[0].url,
        },
        {
          onSuccess: () => {
            onStatusChange('success');
          },
          onError: () => {
            onStatusChange('error');
          },
        }
      );
    });
  };

  const isPending = isTransitionPending || isMutationPending;

  return (
    <Form {...form}>
      <form className='space-y-2' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='image'
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormControl>
                <div
                  {...getRootProps()}
                  className={cn(isPending && 'opacity-50')}
                  onClick={() =>
                    document.getElementById('image-upload')?.click()
                  }
                >
                  {form.watch('imagePreview') ? (
                    <div className='relative pt-[56.25%] w-full h-full'>
                      <Image
                        src={form.watch('imagePreview')!}
                        alt='Preview'
                        className='rounded-xl object-cover'
                        fill
                      />
                    </div>
                  ) : (
                    <div className='cursor-pointer rounded-lg border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl flex flex-col items-center justify-center'>
                      <ImageIcon className='mb-2 h-8 w-8 text-muted-foreground' />
                      <span className='text-xl text-muted-foreground underline'>
                        Upload Here
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        Supported formats: JPG, PNG.
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        Max file size: 4MB.
                      </span>
                    </div>
                  )}
                  <input
                    id='image-upload'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    disabled={isPending}
                    {...getInputProps()}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='caption'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Caption'
                  disabled={isPending}
                  className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TagInput
                  {...field}
                  placeholder='Add tags...'
                  disabled={isPending}
                  className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-center gap-2'>
          <RadioIcon />
          <p className='text-white text-sm'>
            By uploading, you agree to our{' '}
            <Link href='#' className='text-tertiary font-bold hover:underline'>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href='#' className='text-tertiary font-bold hover:underline'>
              Community Guidelines
            </Link>
          </p>
        </div>

        <Button
          type='submit'
          disabled={isPending}
          variant='tertiary'
          className='w-full py-6 font-medium'
        >
          Upload
        </Button>
      </form>
    </Form>
  );
}
