import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { useNewPost } from '../_hooks/use-new-post';

const EmptyScreen = ({ className, ...props }: React.ComponentProps<'div'>) => {
  const { onOpen } = useNewPost();

  return (
    <div
      {...props}
      className={cn(
        'flex flex-col items-center justify-center gap-y-4',
        className
      )}
    >
      <Image
        src='/images/empty-gallery.svg'
        alt='Empty'
        width={300}
        height={300}
      />
      <h6 className='text-white text-2xl font-bold'>Your gallery is empty.</h6>
      <p className='text-muted-foreground'>
        Start uploading your amazing photos today!
      </p>
      <Button
        onClick={onOpen}
        variant='quaternary'
        className='border-tertiary text-tertiary'
      >
        Upload Your First Photo
      </Button>
    </div>
  );
};

export default EmptyScreen;
