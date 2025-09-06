'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PayoutMethodLogosSrc } from '@/constants/payout-methods-logos-src';
import { addPayoutMethodSchema } from '@/schemas';
import { AvailablePayoutMethods } from '@prisma/client';
import Image from 'next/image';
import { useEditPayoutMethod } from '../_api/use-edit-payout-method';

import { cn } from '@/lib/utils';
import { useCreatePayoutMethod } from '../_api/use-create-payout-method';
import { useNewPayoutMethod } from '../_hooks/use-new-payout-method';
import { useOpenPayoutMethod } from '../_hooks/use-open-payout-method';

const FormSchema = addPayoutMethodSchema;

export function PayoutMethodForm() {
  // Get hooks for handling the new method and editing an existing one
  const { onClose: onCloseNew } = useNewPayoutMethod();
  const { onClose: onCloseEdit, data } = useOpenPayoutMethod();

  // Determine if we are in edit mode based on whether an ID exists
  const isEditMode = Boolean(data?.id);

  // Call both hooks unconditionally
  const editPayoutMethod = useEditPayoutMethod(data?.id);
  const createPayoutMethod = useCreatePayoutMethod();

  // Choose the appropriate mutation hook
  const { mutate, isPending } = isEditMode
    ? editPayoutMethod
    : createPayoutMethod;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      identifier: data?.identifier || '',
      method: data?.method || 'PAYPAL',
    },
  });

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    mutate(values, {
      onSuccess: () => {
        if (isEditMode) {
          onCloseEdit();
        } else {
          onCloseNew();
        }
      },
    });
  };

  const selectedMethod = form.watch('method');

 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='method'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className='flex justify-between gap-2 bg-white/10 rounded-full p-2'
                >
                  {Object.values(AvailablePayoutMethods).map((method) => (
                    <FormItem
                      key={method}
                      className='flex items-center space-y-0'
                    >
                      <FormControl>
                        <RadioGroupItem className='hidden' value={method} />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          'rounded-full h-12 w-20 cursor-pointer flex items-center justify-center',
                          selectedMethod === method
                            ? 'bg-tertiary'
                            : 'bg-[#4F4F4F]'
                        )}
                      >
                        <Image
                          width={20}
                          height={20}
                          src={PayoutMethodLogosSrc[method]}
                          alt='logo'
                        />
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='identifier'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder='Please enter your address...'
                  className='border border-white/10 bg-white/[0.03] px-4 py-6 text-white backdrop-blur-xl placeholder:text-white rounded-full'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-center gap-2'>
          <Button
            disabled={isPending}
            type='submit'
            variant='tertiary'
            className='w-full text-center'
          >
            Save
          </Button>
          <Button
            disabled={isPending}
            type='button'
            variant='quaternary'
            className='w-full text-center'
            onClick={isEditMode ? onCloseEdit : onCloseNew}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
