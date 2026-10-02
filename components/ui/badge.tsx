import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// AntiSlop Badge: Soft square rounded-md, NEVER rounded-full pill
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md border transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/10 text-primary',
        secondary:
          'border-border bg-secondary text-secondary-foreground',
        outline:
          'border-border text-foreground bg-card',
        success:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        destructive:
          'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        neutral:
          'border-border bg-muted/60 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
