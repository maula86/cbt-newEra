import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  badge,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 pb-6 md:flex-row md:items-center md:justify-between border-b border-border/50',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
