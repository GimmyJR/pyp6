'use client';

import * as tippingAnimation from '@/animations/lottie/tipping.json';
import { Button } from '@/components/ui/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn, convertAmountToMiliunits, formatCurrency } from '@/lib/utils';
import { tipSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Lottie from 'react-lottie';
import { z } from 'zod';
import { useTipCreator } from '../_api/use-tip-creator';

const presetAmounts = [5, 10, 20, 50];

const formSchema = tipSchema.extend({
  amount: z.string().refine((val) => Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TipForm({
  postId,
  setOpen,
  userBalance,
  onPendingChange,
}: {
  postId?: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userBalance: number;
  onPendingChange?: (isPending: boolean) => void;
}) {
  const { mutate, isPending } = useTipCreator(postId);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  function onSubmit(data: FormValues) {
    mutate(
      {
        amount: convertAmountToMiliunits(Number(data.amount)),
      },
      {
        onSuccess: () => {
          form.reset();
          setSuccess(true);
        },
      }
    );
  }

  useEffect(() => {
    if (selectedAmount) {
      form.setValue('amount', selectedAmount);
    }
  }, [selectedAmount, form]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  if (isPending || success) {
    return (
      <>
        <DialogHeader className='text-center'>
          <Lottie
            options={{
              animationData: tippingAnimation,
              loop: true,
              autoplay: true,
            }}
            height={200}
          />

          {success && (
            <>
              <DialogTitle className='text-xl font-semibold text-center'>
                Thank You for Your Generous Tip!
              </DialogTitle>
              <DialogDescription className='text-muted-foreground text-center'>
                Your tip has been sent successfully. The creator will be
                notified and truly appreciates your support!
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        {success && (
          <DialogFooter className='sm:justify-center'>
            <Button
              onClick={() => setOpen(false)}
              variant='tertiary'
              className='w-full'
            >
              Close Window
            </Button>
          </DialogFooter>
        )}
      </>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-4 gap-2'>
            {presetAmounts.map((presetAmount) => (
              <Button
                key={presetAmount}
                type='button'
                variant='outline'
                className={cn(
                  'rounded-full border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl',
                  parseInt(selectedAmount) === presetAmount &&
                    'border-tertiary border-2 text-tertiary'
                )}
                disabled={isPending}
                onClick={() => setSelectedAmount(presetAmount.toString())}
              >
                ${presetAmount}
              </Button>
            ))}
          </div>

          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='relative rounded-full border border-white/10 bg-white/[0.03] py-1 backdrop-blur-xl'>
                    <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white'>
                      $
                    </div>
                    <Input
                      autoFocus
                      type='number'
                      placeholder='Enter Custom Amount'
                      className='pl-7 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base text-white/80'
                      disabled={isPending}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant='tertiary'
            className='w-full'
            disabled={isPending}
          >
            Proceed to Payment
          </Button>
        </form>
      </Form>
      {!success && (
        <div className='flex items-center justify-between mb-4 p-3 bg-accent/50 rounded-lg'>
          <div className='text-sm'>
            <span className='text-muted-foreground'>Your balance:</span>
            <span className='font-medium ml-1'>
              {formatCurrency(userBalance)}
            </span>
          </div>
          <Link href='/billing'>
            <Button variant='tertiary' size='sm' className='rounded-full'>
              Add funds
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
