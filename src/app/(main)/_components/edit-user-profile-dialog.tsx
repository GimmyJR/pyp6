'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useGetUserProfile } from '../_api/use-get-user-profile';
import { useOpenProfile } from '../_hooks/use-open-profile';
import EditUserProfile from './edit-user-profile-form';
import { DateToString } from '@/types/helper';
import { User } from '@prisma/client';

const EditUserProfileDialog = () => {
  const { isOpen, onClose } = useOpenProfile();

  const { data: user, isLoading } = useGetUserProfile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none rounded-xl max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Your Profile </DialogTitle>
          <DialogDescription className='capitalize'>
            edit your profile
          </DialogDescription>
        </DialogHeader>
        {/* Use relative positioning to define scrollable content */}
        <ScrollArea className='relative max-h-[60vh] pb-2'>
          <div className='p-4'>
            {isLoading ? (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='size-4 animate-spin' />
              </div>
            ) : (
              <EditUserProfile user={user as unknown as DateToString<User> | null} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserProfileDialog;
