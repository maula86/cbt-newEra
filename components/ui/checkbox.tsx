'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
            checked
              ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
              : 'border-slate-300 dark:border-slate-600 bg-card hover:border-primary',
            disabled && 'bg-muted/70 border-border opacity-60 cursor-not-allowed',
            className
          )}
        >
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
