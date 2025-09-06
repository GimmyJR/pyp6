import { create } from 'zustand';

type newAddFundsState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewAddFunds = create<newAddFundsState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
