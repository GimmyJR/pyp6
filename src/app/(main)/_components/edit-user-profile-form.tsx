'use client';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Textarea } from '@/components/ui/textarea';
import { updateUserSchema } from '@/schemas';
import { DateToString } from '@/types/helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gender, SexualOrientation, User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEditUserProfile } from '../_api/use-edit-user-profile';
import { useOpenProfile } from '../_hooks/use-open-profile';

const formSchema = updateUserSchema;

type FormValues = z.infer<typeof formSchema>;

export default function EditUserProfile({
  user,
}: {
  user?: DateToString<User> | null;
}) {
  const { onClose } = useOpenProfile();
  const { mutate, isPending } = useEditUserProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      name: user?.name || '',
      gender: user?.gender || undefined,
      dateOfBirth: user?.dateOfBirth ? new Date(user?.dateOfBirth) : undefined,
      sexualOrientation: user?.sexualOrientation || undefined,
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          name='gender'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Gender).map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name='dateOfBirth'
          control={form.control}
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <DatePicker
                  disabled={isPending}
                  popoverProps={{
                    triggerProps: {
                      className:
                        'justify-start w-full rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl',
                    },
                  }}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='sexualOrientation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexual Orientation</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className='rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
                    <SelectValue placeholder='Select orientation' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SexualOrientation).map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
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
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  maxLength={250}
                  disabled={isPending}
                  className='border border-white/10 bg-white/[0.03] backdrop-blur-xl'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-4 items-center pb-4'>
          <Button type='submit' className='w-full' disabled={isPending}>
            Update Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
