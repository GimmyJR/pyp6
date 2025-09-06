'use client';

import {
  DayPickerProps,
  DayPickerProvider,
  NavigationProvider,
} from 'react-day-picker';

export const ReactDayPickerProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const initialProps: DayPickerProps = {
    mode: 'single',
    showOutsideDays: true,
    modifiers: {},
    modifiersClassNames: {},
    modifiersStyles: {},
  };

  return (
    <DayPickerProvider initialProps={initialProps}>
      <NavigationProvider>{children}</NavigationProvider>
    </DayPickerProvider>
  );
};
