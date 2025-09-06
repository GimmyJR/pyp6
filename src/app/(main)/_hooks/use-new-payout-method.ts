import { create } from 'zustand';

type newPayoutMethodState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewPayoutMethod = create<newPayoutMethodState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
