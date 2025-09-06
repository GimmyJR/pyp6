import { create } from 'zustand';

type newRequestAPayoutState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewRequestAPayout = create<newRequestAPayoutState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
