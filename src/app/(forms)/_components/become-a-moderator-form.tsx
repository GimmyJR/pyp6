'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useSubmitModerateApplication } from '@/app/(forms)/_api/use-submit-moderate-application';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ModeratorApplicationSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gender } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function BecomeAModeratorForm() {
  const { mutate, isPending } = useSubmitModerateApplication();

  const form = useForm<z.infer<typeof ModeratorApplicationSchema>>({
    resolver: zodResolver(ModeratorApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      profileLink: '',
      gender: undefined,
      age: '',
      location: '',
      moderatorStatement: '',
      dedicatedTimePerWeek: '',
    },
    shouldUnregister: true,
  });

  const onSubmit = (values: z.infer<typeof ModeratorApplicationSchema>) => {
    form.reset();
    mutate(values, {
      onSettled: () => form.reset(),
    });
  };

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex flex-col items-center gap-4 lg:flex-row'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='First Name'
                    disabled={isPending}
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Last Name'
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col items-center gap-4 lg:flex-row'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Email Address'
                    disabled={isPending}
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='profileLink'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Link to Your Profile Page'
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col items-center gap-4 lg:flex-row'>
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
                    <SelectTrigger className='border border-white/10 bg-transparent px-4 py-6 capitalize'>
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
            name='age'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    placeholder='Age'
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col items-center gap-4 lg:flex-row'>
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Location (City/State)'
                    disabled={isPending}
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dedicatedTimePerWeek'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    placeholder='time you can give per week'
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-xs placeholder:text-white'
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='moderatorStatement'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Why do you want to become a moderator?'
                  className='border border-white/10 bg-transparent text-white backdrop-blur-xl placeholder:text-white'
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          disabled={isPending}
          variant='tertiary'
          className='px-8 py-6 font-medium'
        >
          Submit Application
        </Button>
      </form>
    </Form>
  );
}
