'use client';

import { login } from '@/actions/login';
import { register } from '@/actions/register';
import { DatePicker } from '@/components/date-picker';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RegisterSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gender, SexualOrientation } from '@prisma/client';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { throwConfetti } from '@/confetti';
import { useUploadThing } from '@/lib/uploadthing';
import { useDropzone } from '@uploadthing/react';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';

export default function SignupForm() {
  // images
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);

    const file = acceptedFiles[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { startUpload, routeConfig } = useUploadThing('imageUploader', {
    onUploadError: (e) => {
      toast.error(e.message || 'image upload failed!');
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
  });
  // form
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      gender: undefined,
      sexualOrientation: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('');
    setSuccess('');

    startTransition(async () => {
      if (files.length) {
        const uploadedFiles = await startUpload(files);

        if (!uploadedFiles) {
          return;
        }

        values.image = uploadedFiles[0].url;
      }

      register(values).then((data) => {
        setError(data.error);

        if (data.success) {
          setSuccess(data.success);
          throwConfetti('fireworks');
          login({ email: values.email, password: values.password });
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-y-4 sm:gap-8 lg:grid-cols-5'>
          <div
            className={cn(
              'col-span-2 flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 transition-colors hover:border-white/20',
              imagePreview && 'border-0'
            )}
            onClick={() => document.getElementById('image-upload')?.click()}
            {...getRootProps()}
          >
            {imagePreview ? (
              <div className='relative pt-[100%] w-full h-full'>
                <Image
                  src={imagePreview}
                  alt='Preview'
                  className='rounded-xl object-cover'
                  fill
                />
              </div>
            ) : (
              <div className='min-h-52 lg:min-h-full flex flex-col items-center justify-center'>
                <Upload className='mb-2 h-8 w-8 text-white/80' />
                <span className='text-sm text-white/50'>Upload your Image</span>
              </div>
            )}
            <input
              id='image-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageUpload}
              {...getInputProps()}
            />
          </div>

          <div className='col-span-3 space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='text'
                      placeholder='username'
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Email'
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
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder='Password'
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
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder='Confirm Password'
                      disabled={isPending}
                      className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col items-center gap-4 lg:flex-row'>
              <FormField
                name='dateOfBirth'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormControl>
                      <DatePicker
                        buttonProps={{
                          className:
                            'border border-white/10 bg-transparent hover:bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white rounded-full',
                        }}
                        popoverProps={{
                          triggerProps: {
                            className: 'justify-start w-full',
                          },
                        }}
                        placeholder='Date of Birth'
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-4 lg:flex-row'>
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 capitalize'>
                          <SelectValue
                            placeholder='Gender'
                            className='text-white placeholder:text-white'
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-gradient-image capitalize'>
                        {Object.values(Gender).map((key) => (
                          <SelectItem
                            key={key}
                            value={Gender[key]}
                            className='my-1 cursor-pointer border !border-white/10 !bg-white/[0.05] text-white transition-all hover:!bg-white/[0.1] focus:!bg-white/[0.1]'
                          >
                            {Gender[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sexualOrientation'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 capitalize'>
                          <SelectValue
                            placeholder='Sexual Orientation'
                            className='text-white placeholder:text-white'
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-gradient-image capitalize'>
                        {Object.values(SexualOrientation).map((key) => (
                          <SelectItem
                            key={key}
                            value={SexualOrientation[key]}
                            className='my-1 cursor-pointer border !border-white/10 !bg-white/[0.05] text-white transition-all hover:!bg-white/[0.1] focus:!bg-white/[0.1]'
                          >
                            {SexualOrientation[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription className='text-xs'>
                      {
                        "This information is private and won't be displayed on your profile."
                      }
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormSuccess message={success} />
            <FormError message={error} />

            <Button
              type='submit'
              disabled={isPending}
              variant='tertiary'
              className='w-full py-6 font-medium'
            >
              Sign Up
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
