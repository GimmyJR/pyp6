import AddFundsDialog from './add-funds-dialog';
import AddPayoutMethodDialog from './add-payout-method-dialog';
import CreatePostDialog from './create-post-dialog';
import EditPayoutMethodDialog from './edit-payout-method-dialog';
import EditUserProfileDialog from './edit-user-profile-dialog';
import RequestAPayoutDialog from './request-a-payout-dialog';
import SettingsDialog from './settings-dialog';

export default function MainProvider() {
  return (
    <>
      <CreatePostDialog />
      <EditUserProfileDialog />
      <AddPayoutMethodDialog />
      <EditPayoutMethodDialog />
      <RequestAPayoutDialog />
      <AddFundsDialog />
      <SettingsDialog />
    </>
  );
}
