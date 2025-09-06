'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { transactionSchema } from '@/schemas';

import addFundsAnimation from '@/animations/lottie/add-funds.json';
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
import { Textarea } from '@/components/ui/textarea';
import { paymentQRS } from '@/constants/payment-qrs';
import { PayoutMethodLogosSrc } from '@/constants/payout-methods-logos-src';
import { convertAmountToMiliunits } from '@/lib/utils';
import { AvailablePayoutMethods } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Lottie from 'react-lottie';
import { useCreateTransaction } from '../_api/use-create-transaction';
import { useGetUserProfile } from '../_api/use-get-user-profile';
import { usePaypalCheckoutMutation } from '../_api/use-paypal-checkout';
import { useStripeCheckoutMutation } from '../_api/use-stripe-checkout';
import { useNewAddFunds } from '../_hooks/use-new-add-funds';

const FormSchema = transactionSchema.omit({ type: true }).extend({
  amount: z.string().refine((val) => Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  identifier: z.string().optional(),
});

export function AddFundsForm({
  onPendingChange,
}: {
  onPendingChange?: (isPending: boolean) => void;
}) {
  const { onClose } = useNewAddFunds();

  const { data: user, isLoading } = useGetUserProfile();

  const { mutate: stripeCheckoutMutate, isPending: isStripeCheckoutPending } =
    useStripeCheckoutMutation();
  const { mutate: paypalCheckoutMutate, isPending: isPaypalCheckoutPending } =
    usePaypalCheckoutMutation();
  const { mutate, isPending: isTransactionPending } = useCreateTransaction();

  const [success, setSuccess] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lottieRef = useRef<any>(null);

  // Handle animation completion when success is true
  useEffect(() => {
    if (success && lottieRef.current) {
      // Set a timeout to pause the animation after a loop
      const timer = setTimeout(() => {
        setIsPaused(true);
      }, 2000); // Adjust timing as needed

      return () => clearTimeout(timer);
    }
  }, [success]);

  const isCheckoutPending = isStripeCheckoutPending || isPaypalCheckoutPending;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      method: 'STRIPE',
    },
  });

  const isPending = isCheckoutPending || isTransactionPending;

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    switch (values.method) {
      case AvailablePayoutMethods.STRIPE:
        stripeCheckoutMutate(
          {
            amount: convertAmountToMiliunits(Number(values.amount) / 10), // converts amount to cents
          },
          {
            onSuccess: () => {
              setSuccess(true);
            },
          }
        );
        break;
      case AvailablePayoutMethods.PAYPAL:
        paypalCheckoutMutate(
          {
            amount: convertAmountToMiliunits(Number(values.amount)),
          },
          {
            onSuccess: () => {
              setSuccess(true);
            },
          }
        );
        break;
      default:
        mutate(
          {
            ...values,
            amount: convertAmountToMiliunits(Number(values.amount)),
            type: 'DEPOSIT',
          },
          {
            onSuccess: () => {
              setSuccess(true);
            },
          }
        );
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!user) return;

  const selectedMethod = form.watch('method');

  if (isPending || success) {
    return (
      <>
        <DialogHeader className='text-center'>
          <Lottie
            ref={lottieRef}
            options={{
              animationData: addFundsAnimation,
              autoplay: true,
              loop: true,
            }}
            height={400}
            isPaused={isPaused}
          />

          {success && (
            <>
              <DialogTitle className='text-xl font-semibold text-center'>
                The transaction is now being Processed!
              </DialogTitle>
              <DialogDescription className='text-muted-foreground text-center'>
                Your transaction has been created successfully and is now being
                processed.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        {success && (
          <DialogFooter className='sm:justify-center'>
            <Button onClick={onClose} variant='tertiary' className='w-full'>
              Done
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
                      placeholder='Select Payment Method'
                      className='text-white placeholder:text-white'
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='capitalize'>
                  {Object.values(AvailablePayoutMethods).map((method) => (
                    <SelectItem
                      key={method}
                      value={method}
                      className='cursor-pointer'
                    >
                      <div className='flex items-center gap-1'>
                        <Image
                          width={16}
                          height={16}
                          src={PayoutMethodLogosSrc[method]}
                          alt='logo'
                        />
                        {method}
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
                <div className='relative border border-white/10 bg-white/[0.03] text-white backdrop-blur-xl rounded-full'>
                  <span className='absolute top-1/2 left-4 transform -translate-y-1/2'>
                    $
                  </span>
                  <Input
                    type='number'
                    disabled={isPending}
                    placeholder='Enter Deposit Amount'
                    className='pl-8 pr-4 py-6 placeholder:text-white bg-transparent border-0 outline-none focus-visible:ring-0 focus:ring-0 ring-0 focus-within:ring-0 focus:ring-offset-0 ring-offset-0 focus-visible:ring-offset-0'
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedMethod !== AvailablePayoutMethods.PAYPAL &&
          selectedMethod !== AvailablePayoutMethods.STRIPE && (
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder='Add a note...'
                      className='border border-white/10 bg-white/[0.03] px-4 py-6 text-white backdrop-blur-xl placeholder:text-white rounded-md'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    {'Use the phrase INTERNET in the note'}
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

        {selectedMethod !== AvailablePayoutMethods.PAYPAL &&
          selectedMethod !== AvailablePayoutMethods.STRIPE && (
            <div className='space-y-2 flex flex-col items-center justify-center text-center'>
              <p className='text-muted-foreground text-sm'>
                {selectedMethod === AvailablePayoutMethods.VENMO ||
                selectedMethod === AvailablePayoutMethods.ZELLE
                  ? 'Identifier: '
                  : 'Wallet Address: '}
                <span className='font-semibold break-all'>
                  {
                    paymentQRS[selectedMethod as keyof typeof paymentQRS]
                      ?.identifier
                  }
                </span>
              </p>
              <Image
                src={paymentQRS[selectedMethod as keyof typeof paymentQRS]?.src}
                width={250}
                height={250}
                alt='QR'
              />
              <FormDescription>
                {selectedMethod === AvailablePayoutMethods.VENMO ||
                selectedMethod === AvailablePayoutMethods.ZELLE
                  ? 'You have to manually transfer the amount to this QR. Please make Sure to create a transaction before transfer.'
                  : 'Send the exact amount to the wallet address above or scan the QR code. Please create a transaction before transfer.'}
              </FormDescription>
            </div>
          )}

        <Button
          disabled={isPending}
          type='submit'
          variant='tertiary'
          className='w-full text-center'
        >
          Add Funds
        </Button>
      </form>
    </Form>
  );
}
