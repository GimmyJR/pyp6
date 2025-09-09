'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOpenSettings } from '../_hooks/use-open-settings';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { updateUserSettingsSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEditUserSettings } from '../_api/use-edit-user-settings';

const FormSchema = updateUserSettingsSchema;

const SettingsDialog = () => {
  const { onClose, isOpen, data } = useOpenSettings();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      anonymous: data?.anonymous || undefined,
      sent_email_notifications: data?.sent_email_notifications || undefined,
    },
  });

  const { mutate, isPending } = useEditUserSettings();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate(data, {
      onSuccess: onClose,
    });
  }

  useEffect(() => {
    form.setValue('anonymous', data?.anonymous || undefined);
    form.setValue('sent_email_notifications', data?.sent_email_notifications);
  }, [data, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none rounded-xl'>
        <DialogHeader>
          <DialogTitle>Customize your experience!</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-6'
          >
            <div>
              <h3 className='mb-4 text-lg font-medium'>Privacy</h3>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='anonymous'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl'>
                      <div className='space-y-0.5 text-white/80'>
                        <FormLabel className='text-base font-normal'>
                          Stay Anonymous
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              <h3 className='mb-4 text-lg font-medium'>Notifications</h3>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='sent_email_notifications'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl'>
                      <div className='space-y-0.5 text-white/80'>
                        <FormLabel className='text-base font-normal'>
                          Send Emails
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button
              disabled={isPending}
              type='submit'
              className='w-full'
              variant='tertiary'
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
