import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PayoutMethodLogosSrc } from '@/constants/payout-methods-logos-src';
import { useConfirm } from '@/hooks/use-confirm';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useDeletePayoutMethod } from '../_api/use-delete-payout-method';
import { useGetPayoutMethods } from '../_api/use-get-payout-methods';
import { useNewPayoutMethod } from '../_hooks/use-new-payout-method';
import { useOpenPayoutMethod } from '../_hooks/use-open-payout-method';

const PayoutMethodCard = () => {
  const { data: payoutMethods, isLoading } = useGetPayoutMethods();

  const [id, setId] = useState<string | undefined>(undefined);

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure you want to delete this payout method?',
    'You are about to delete this payout method. This action cannot be undone.'
  );

  const { mutate, isPending } = useDeletePayoutMethod(id);

  const handleDelete = async () => {
    const ok = await confirm();

    if (ok) {
      mutate();
    }
  };

  const { onOpen: onOpenCreatePayoutMethod } = useNewPayoutMethod();
  const { onOpen: onOpenEditPayoutMethod } = useOpenPayoutMethod();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <Card className='border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
        <CardHeader>
          <CardTitle>Saved Payout Methods</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {payoutMethods?.map((item) => (
            <div
              key={item.id}
              className='border border-white/10 bg-white/[0.01] px-4 py-6 backdrop-blur-xl space-y-2 rounded-2xl'
            >
              <Image
                width={40}
                height={40}
                src={PayoutMethodLogosSrc[item.method]}
                alt='logo'
              />
              <p className='text-sm text-white'>{item.identifier}</p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='tertiary'
                  className='px-8 w-full'
                  disabled={isPending}
                  onClick={() => onOpenEditPayoutMethod(item)}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setId(item.id);
                    handleDelete();
                  }}
                  variant='quaternary'
                  className='px-8 w-full'
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter
          className='justify-center hover:underline cursor-pointer'
          onClick={onOpenCreatePayoutMethod}
        >
          + Add New Method
        </CardFooter>
      </Card>
    </>
  );
};

export default PayoutMethodCard;
