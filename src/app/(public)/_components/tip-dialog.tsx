'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import TipForm from './tip-form';

const TipDialog = ({
  postId,
  userBalance,
}: {
  postId?: string;
  userBalance: number;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog when isPending is true
    if (isPending && !newOpen) {
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant='tertiary'
          className='py-6 px-6'
        >
          Tip
        </Button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton={isPending}
        className='border-none rounded-xl max-w-md'
      >
        <DialogHeader>
          <DialogTitle>Select an amount to tip</DialogTitle>
        </DialogHeader>
        <TipForm
          postId={postId}
          setOpen={setOpen}
          userBalance={userBalance}
          onPendingChange={setIsPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TipDialog;
