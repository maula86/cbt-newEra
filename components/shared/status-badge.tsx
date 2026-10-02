import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'completed'
  | 'cancelled'
  | 'lulus'
  | 'tidak-lulus'
  | 'hadir'
  | 'belum-hadir'
  | 'selesai';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, '-');

  let variant: 'success' | 'warning' | 'destructive' | 'neutral' = 'neutral';
  let label = status;

  switch (normalized) {
    case 'active':
    case 'aktif':
      variant = 'success';
      label = 'Aktif';
      break;
    case 'inactive':
    case 'nonaktif':
      variant = 'neutral';
      label = 'Nonaktif';
      break;
    case 'draft':
      variant = 'warning';
      label = 'Draft';
      break;
    case 'completed':
    case 'selesai':
      variant = 'success';
      label = 'Selesai';
      break;
    case 'cancelled':
    case 'dibatalkan':
      variant = 'destructive';
      label = 'Dibatalkan';
      break;
    case 'lulus':
      variant = 'success';
      label = 'Lulus';
      break;
    case 'tidak-lulus':
      variant = 'destructive';
      label = 'Tidak Lulus';
      break;
    case 'hadir':
      variant = 'success';
      label = 'Hadir';
      break;
    case 'belum-hadir':
      variant = 'warning';
      label = 'Belum Hadir';
      break;
    default:
      variant = 'neutral';
      label = status;
  }

  return (
    <Badge variant={variant} className={cn('font-medium text-[11px]', className)}>
      {label}
    </Badge>
  );
}
