import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-lg border border-border bg-card px-3 py-1.5 pr-8 text-sm text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
