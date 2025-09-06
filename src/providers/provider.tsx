import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { QueryProvider } from './query-provider';
import { ReactDayPickerProviders } from './react-day-picker-providers';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ReactDayPickerProviders>
          <Toaster richColors />
          {children}
        </ReactDayPickerProviders>
      </QueryProvider>
    </SessionProvider>
  );
}
