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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { transactionSchema } from '@/schemas';

import withdrawAnimation from '@/animations/lottie/withdraw.json';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PayoutMethodLogosSrc } from '@/constants/payout-methods-logos-src';
import { convertAmountToMiliunits, formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Lottie from 'react-lottie';
import { useCreateTransaction } from '../_api/use-create-transaction';
import { useGetUserProfile } from '../_api/use-get-user-profile';
import { useNewRequestAPayout } from '../_hooks/use-new-request-a-payout';

const FormSchema = transactionSchema.omit({ type: true }).extend({
  amount: z.string().refine((val) => Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
});

export function RequestAPayoutForm({
  onPendingChange,
}: {
  onPendingChange?: (isPending: boolean) => void;
}) {
  const { onClose } = useNewRequestAPayout();

  const { data: user, isLoading } = useGetUserProfile();

  const { mutate, isPending } = useCreateTransaction();

  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    mutate(
      {
        ...values,
        amount: convertAmountToMiliunits(Number(values.amount)),
        type: 'WITHDRAWAL',
      },
      {
        onSuccess: () => {
          setSuccess(true);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!user) return;

  if (isPending || success) {
    return (
      <>
        <DialogHeader className='text-center'>
          <Lottie
            options={{
              animationData: withdrawAnimation,
              loop: true,
              autoplay: true,
            }}
            height={200}
          />

          {success && (
            <>
              <DialogTitle className='text-xl font-semibold text-center'>
                Withdrawal Request Submitted!
              </DialogTitle>
              <DialogDescription className='text-muted-foreground text-center'>
                Your payout request has been submitted successfully and will be
                processed within 2-3 business days.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        {success && (
          <DialogFooter className='sm:justify-center'>
            <Button onClick={onClose} variant='tertiary' className='w-full'>
              Close Window
            </Button>
          </DialogFooter>
        )}
      </>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='method'
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
                      placeholder='Select Payout Method'
                      className='text-white placeholder:text-white'
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='capitalize'>
                  {user?.PayoutMethod?.map((method) => (
                    <SelectItem
                      key={method.id}
                      value={method.method}
                      className='cursor-pointer'
                    >
                      <div className='flex items-center gap-1'>
                        <Image
                          width={16}
                          height={16}
                          src={PayoutMethodLogosSrc[method.method]}
                          alt='logo'
                        />
                        {method.method}
                      </div>
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
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type='number'
                  disabled={isPending}
                  placeholder='Enter Payout Amount'
                  className='border border-white/10 bg-white/[0.03] px-4 py-6 text-white backdrop-blur-xl placeholder:text-white rounded-full'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='text-center'>
          <p className='text-sm text-white/80'>You can withdraw up to </p>
          <p className='text-white text-xl font-bold'>
            {formatCurrency(user.balance)}
          </p>
        </div>

        <Button
          disabled={isPending}
          type='submit'
          variant='tertiary'
          className='w-full text-center'
        >
          Submit Request
        </Button>
        <p className='text-xs text-white/90 font-light text-center'>
          Estimated Time: 2-3 Business Days
        </p>
      </form>
    </Form>
  );
}
