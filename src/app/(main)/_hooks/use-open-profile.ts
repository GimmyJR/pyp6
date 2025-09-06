import { create } from 'zustand';

type openProfileState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useOpenProfile = create<openProfileState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
