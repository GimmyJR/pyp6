import { create } from 'zustand';

type Status = 'filling' | 'submitting' | 'success' | 'error';

type newPostState = {
  status: Status;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onStatusChange: (status: Status) => void;
};

export const useNewPost = create<newPostState>((set) => ({
  status: 'filling',
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, status: 'filling' }),
  onStatusChange: (status) => set({ status }),
}));
