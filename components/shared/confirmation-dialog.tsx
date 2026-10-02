'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title = 'Konfirmasi Tindakan',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus Data',
  cancelLabel = 'Batal',
  variant = 'destructive',
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-foreground">
            {variant === 'destructive' && (
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
