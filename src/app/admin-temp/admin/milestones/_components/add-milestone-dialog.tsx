'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNewMilestone } from '../_hooks/use-new-milestone';
import { MilestoneForm } from './milestone-form';

export function AddMilestoneDialog() {
  const { isOpen, onClose } = useNewMilestone();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <MilestoneForm />
      </DialogContent>
    </Dialog>
  );
}
