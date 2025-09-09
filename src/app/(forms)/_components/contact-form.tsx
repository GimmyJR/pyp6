'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/textarea';
import { ContactFormSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSubmitContactForm } from '../_api/use-submit-contact-form';
import { InquiryType } from '@prisma/client';

export default function ContactForm() {
  const { mutate, isPending } = useSubmitContactForm();

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      inquiryType: undefined,
      subject: '',
      message: '',
    },
    shouldUnregister: true,
  });

  const onSubmit = (values: z.infer<typeof ContactFormSchema>) => {
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
            name='phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Phone Number (Optional)'
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
            name='inquiryType'
            render={({ field }) => (
              <FormItem className='w-full'>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className='border border-white/10 bg-transparent px-4 py-6'>
                      <SelectValue
                        placeholder='Inquiry Type'
                        className='text-white placeholder:text-white'
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='bg-gradient-image'>
                    {Object.entries(InquiryType).map(([key, value]) => (
                      <SelectItem
                        key={key}
                        value={value}
                        className='my-1 cursor-pointer border !border-white/10 !bg-white/[0.05] text-white transition-all hover:!bg-white/[0.1] focus:!bg-white/[0.1]'
                      >
                        {key.replace(/_/g, ' ')}
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
            name='subject'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Subject'
                    className='border border-white/10 bg-transparent px-4 py-6 text-white backdrop-blur-xl placeholder:text-white'
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
          name='message'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Your Message'
                  className='border border-white/10 bg-transparent text-white backdrop-blur-xl placeholder:text-white'
                  disabled={isPending}
                  rows={5}
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
          Send Message
        </Button>
      </form>
    </Form>
  );
}
