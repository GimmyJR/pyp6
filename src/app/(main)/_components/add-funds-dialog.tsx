'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useNewAddFunds } from '../_hooks/use-new-add-funds';
import { AddFundsForm } from './add-funds-form';

const AddFundsDialog = () => {
  const { onClose, isOpen } = useNewAddFunds();
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
          <DialogTitle>Add Funds</DialogTitle>
        </DialogHeader>
        <AddFundsForm onPendingChange={setIsPending} />
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;
