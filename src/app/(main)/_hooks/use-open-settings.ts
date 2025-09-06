import { DateToString } from '@/types/helper';
import { User } from '@prisma/client';
import { create } from 'zustand';

type Data = DateToString<
  Partial<Pick<User, 'anonymous' | 'sent_email_notifications'>>
>;

type openSettingsState = {
  data?: Data;
  isOpen: boolean;
  onOpen: (data: Data) => void;
  onClose: () => void;
};

export const useOpenSettings = create<openSettingsState>((set) => ({
  data: undefined,
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
