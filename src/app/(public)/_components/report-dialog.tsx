import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { useState } from 'react';
import { ReportForm } from './report-form';

const ReportDialog = ({ postId }: { postId?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className='absolute top-0 right-4'>
        <Button className='bg-white/10 hover:bg-white/20 transition-colors !text-rose-500 !m-0'>
          <Flag className='size-4' />
          Report Profile
        </Button>
      </DialogTrigger>
      <DialogContent className='border-none rounded-3xl max-w-md'>
        <DialogHeader>
          <DialogTitle>Report Photo</DialogTitle>
          <DialogDescription>
            {"Tell us why you're reporting this photo."}
          </DialogDescription>
        </DialogHeader>
        <ReportForm postId={postId} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
