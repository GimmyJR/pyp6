'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      showValue = false,
      valuePrefix = '',
      valueSuffix = '%',
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<number[]>(
      (props.defaultValue as number[]) || [0]
    );

    React.useEffect(() => {
      if (props.value) {
        setValue(props.value as number[]);
      }
    }, [props.value]);

    const handleValueChange = (newValue: number[]) => {
      setValue(newValue);
      if (props.onValueChange) {
        props.onValueChange(newValue);
      }
    };

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-secondary'>
          <SliderPrimitive.Range className='absolute h-full bg-tertiary' />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className='flex items-center justify-center min-w-6 h-6 w-6 rounded-full border border-dashed border-black/50 bg-tertiary text-black text-xs font-bold ring-offset-tertiary transition-colors focus-visible:outline-none ring-2 ring-tertiary focus-visible:ring-2 focus-visible:ring-transparent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'>
          {showValue && (
            <span className='select-none text-[7px]'>
              {valuePrefix}
              {Math.round(value[0])}
              {valueSuffix}
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
