import { DateToString } from '@/types/helper';
import { PayoutMethod } from '@prisma/client';
import { create } from 'zustand';

type OpenPayoutMethodState = {
  data?: DateToString<PayoutMethod>;
  isOpen: boolean;
  onOpen: (data: DateToString<PayoutMethod>) => void;
  onClose: () => void;
};

export const useOpenPayoutMethod = create<OpenPayoutMethodState>((set) => ({
  data: undefined,
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
