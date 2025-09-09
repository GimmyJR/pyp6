import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('text-3xl font-bold text-white', className)} {...props}>
      LOGO
    </div>
  );
};

export default Logo;
