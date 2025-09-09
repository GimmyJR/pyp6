import { AddMilestoneDialog } from '../admin/milestones/_components/add-milestone-dialog';
import EditUserSheet from '../admin/users/_components/edit-user-sheet';

export default function AdminProvider() {
  return (
    <>
      <EditUserSheet />
      <AddMilestoneDialog />
    </>
  );
}
