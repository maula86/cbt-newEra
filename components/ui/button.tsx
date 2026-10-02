import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// AntiSlop Button Family: Soft Square (rounded-lg or rounded-md, NEVER rounded-full)
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.99] rounded-lg',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 active:scale-[0.99] rounded-lg',
        outline:
          'border border-border bg-card text-foreground hover:bg-accent/40 hover:text-accent-foreground active:scale-[0.99] rounded-lg',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.99] rounded-lg',
        ghost:
          'text-foreground hover:bg-accent/40 hover:text-accent-foreground rounded-lg',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 px-2.5 text-xs',
        lg: 'h-10 px-5 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
