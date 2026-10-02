'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-md border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted border-border',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-3.5 w-3.5 rounded-sm bg-background shadow-xs ring-0 transition-transform',
          checked ? 'translate-x-4 bg-white' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
