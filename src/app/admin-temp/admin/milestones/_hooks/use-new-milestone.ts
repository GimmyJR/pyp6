import { create } from 'zustand';

type newMilestoneState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useNewMilestone = create<newMilestoneState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
