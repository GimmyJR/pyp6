import { useState } from 'react';
export const useOpenUser = () => {
  const [open, setOpen] = useState(false);
  const openUser = () => setOpen(true);
  const closeUser = () => setOpen(false);
  return { open, openUser, closeUser };
};
