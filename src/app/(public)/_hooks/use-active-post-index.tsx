import { create } from 'zustand';

type ActivePostIndexProps = {
  index: number;
  setIndex: (idx: number) => void;
};

export const useActivePostIndex = create<ActivePostIndexProps>((set) => ({
  index: 0,
  setIndex: (idx: number) => set({ index: idx }),
}));
