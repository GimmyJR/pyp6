'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SuccessIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { ImageOff, Loader2 } from 'lucide-react';
import { useNewPost } from '../_hooks/use-new-post';
import CreatePostForm from './create-post-form';

const CreatePostDialog = () => {
  const { isOpen, onClose, status, onStatusChange } = useNewPost();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none rounded-xl max-w-3xl'>
        {status === 'success' && (
          <div className='min-h-40 py-20 flex items-center justify-center'>
            <div className='max-w-md flex flex-col items-center justify-center text-center space-y-2'>
              <SuccessIcon size={70} />
              <p className='font-bold text-2xl'>
                Photo Uploaded Successfully! <br /> Keep it up!
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className='min-h-40 py-20 flex items-center justify-center'>
            <div className='max-w-md flex flex-col items-center justify-center text-center space-y-2'>
              <ImageOff size={70} />
              <p className='font-bold text-2xl'>
                Unsupported file type or file too large.
              </p>
              <span className='text-muted-foreground text-sm'>
                Please try again.
              </span>
              <Button
                variant='tertiary'
                onClick={() => onStatusChange('filling')}
              >
                Reupload
              </Button>
            </div>
          </div>
        )}

        {status === 'submitting' && (
          <div className='min-h-40 flex items-center justify-center'>
            <Loader2 className='w-24 h-24 animate-spin text-muted-foreground' />
          </div>
        )}

        <div className={cn('space-y-4', status !== 'filling' && 'hidden')}>
          <DialogHeader>
            <DialogTitle>
              Show the world your creativity.{' '}
              <span className='text-tertiary'>Upload now!</span>
            </DialogTitle>
          </DialogHeader>
          <CreatePostForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
