'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOpenPayoutMethod } from '../_hooks/use-open-payout-method';
import { PayoutMethodForm } from './payout-method-form';

const EditPayoutMethodDialog = () => {
  const { onClose, isOpen } = useOpenPayoutMethod();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none rounded-3xl max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit Payout Method</DialogTitle>
        </DialogHeader>
        <PayoutMethodForm />
      </DialogContent>
    </Dialog>
  );
};

export default EditPayoutMethodDialog;
