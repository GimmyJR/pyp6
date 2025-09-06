import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SelectSingleEventHandler } from 'react-day-picker';

import { Button, ButtonProps } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  PopoverContentProps,
  PopoverTriggerProps,
} from '@radix-ui/react-popover';

type Props = {
  value?: Date;
  onChange?: SelectSingleEventHandler;
  disabled?: boolean;
  placeholder?: string;
  buttonProps?: ButtonProps;
  popoverProps?: {
    triggerProps?: Partial<PopoverTriggerProps>;
    contentProps?: Partial<PopoverContentProps>;
  };
  defaultMonth?: Date;
};

export const DatePicker = ({
  value,
  onChange,
  disabled,
  placeholder = 'Pick a date',
  buttonProps,
  popoverProps,
  defaultMonth,
}: Props) => {
  // Calculate default date to show (16 years ago)
  const sixteenYearsAgo = new Date();
  sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

  return (
    <Popover>
      <PopoverTrigger asChild {...popoverProps?.triggerProps}>
        <Button
          disabled={disabled}
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            buttonProps?.className
          )}
          {...buttonProps}
        >
          <CalendarIcon className='size-4' />
          {value ? format(value, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-auto p-0', popoverProps?.contentProps?.className)}
        {...popoverProps?.contentProps}
      >
        <Calendar
          mode='single'
          captionLayout='dropdown-buttons'
          selected={value}
          onSelect={onChange}
          fromYear={1900}
          toYear={new Date().getFullYear()}
          defaultMonth={value || defaultMonth || sixteenYearsAgo}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
