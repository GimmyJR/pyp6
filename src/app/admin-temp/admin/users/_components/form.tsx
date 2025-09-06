import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useState } from 'react';

const Form = () => {
  const user = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState(user);

  if (!user || !selectedUser) return <></>;

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline' onClick={() => setSelectedUser(user)}>
            Manage User
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              {`Make changes to the user's profile here. Click save when
                      you're done.`}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Form;
