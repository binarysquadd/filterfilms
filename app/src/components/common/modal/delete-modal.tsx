'use client';

import { Loader2, Trash2, X } from 'lucide-react';
import { Button } from '../../ui/button';

interface DeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  open,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <Trash2 className="w-5 h-5" />
            {title}
          </div>
          <Button variant={'close'} size={'icon'} onClick={onCancel} disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 text-sm text-muted-foreground">{description}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <Button variant="cancel" onClick={onCancel} disabled={loading} size="default">
            Cancel
          </Button>

          <Button variant="destructive" onClick={onConfirm} disabled={loading} size="default">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
