'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNewPayoutMethod } from '../_hooks/use-new-payout-method';
import { PayoutMethodForm } from './payout-method-form';

const AddPayoutMethodDialog = () => {
  const { onClose, isOpen } = useNewPayoutMethod();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none rounded-3xl max-w-xl'>
        <DialogHeader>
          <DialogTitle>Add New Payout Method</DialogTitle>
        </DialogHeader>
        <PayoutMethodForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddPayoutMethodDialog;
