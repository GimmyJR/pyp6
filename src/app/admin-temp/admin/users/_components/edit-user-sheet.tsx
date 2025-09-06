'use client';

import { useDeleteUser } from '@/app/(admin)/_api/use-delete-user';
import { useEditUser } from '@/app/(admin)/_api/use-edit-user';
import { useGetUser } from '@/app/(admin)/_api/use-get-user';
import { useOpenUser } from '@/app/(admin)/_hooks/use-open-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useConfirm } from '@/hooks/use-confirm';
import { Loader2 } from 'lucide-react';
import { EditUserForm, FormValues } from './edit-user-form';

const EditUserSheet = () => {
  const { isOpen, onClose, id } = useOpenUser();

  const [ConfirmDialog, confirm] = useConfirm(
    'Are you sure you want to delete this user?',
    'You are about to delete this user. This action cannot be undone.'
  );

  const { data, isLoading } = useGetUser(id);

  const editMutation = useEditUser(id);
  const deleteMutation = useDeleteUser(id);

  const isPending = editMutation.isPending || deleteMutation.isPending;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const defaultValues = data
    ? {
        username: data.username || '',
        email: data.email || '',
        name: data.name || '',
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        location: data.location || '',
        bio: data.bio || '',
        sexualOrientation: data.sexualOrientation || undefined,
        role: data.role || '',
        banned: data.banned || false,
        suspended: data.suspended ? new Date(data.suspended) : undefined,
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='space-y-4'>
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>Edit an existing user</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className='absolute inset-0 flex justify-center items-center'>
              <Loader2 className='size text-muted-foreground animate-spin' />
            </div>
          ) : (
            <ScrollArea className='h-full'>
              <div className='p-1 pr-4'>
                <EditUserForm
                  id={id}
                  onSubmit={onSubmit}
                  disabled={isPending}
                  defaultValues={defaultValues}
                  onDelete={onDelete}
                />
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EditUserSheet;
