'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useNewRequestAPayout } from '../_hooks/use-new-request-a-payout';
import { RequestAPayoutForm } from './request-a-payout-form';

const RequestAPayoutDialog = () => {
  const { onClose, isOpen } = useNewRequestAPayout();
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog when isPending is true
    if (isPending && !newOpen) {
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton={isPending}
        className='border-none rounded-3xl max-w-md'
      >
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
        </DialogHeader>
        <RequestAPayoutForm onPendingChange={setIsPending} />
      </DialogContent>
    </Dialog>
  );
};

export default RequestAPayoutDialog;
