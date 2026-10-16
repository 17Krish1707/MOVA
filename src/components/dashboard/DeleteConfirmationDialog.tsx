import React from 'react';
import type { Delivery } from '../../types/dashboard';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  delivery: Delivery | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  error?: string | null;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  delivery,
  onConfirm,
  onCancel,
  isDeleting,
  error,
}) => {
  if (!isOpen || !delivery) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-base font-bold text-white">
                Delete Delivery Order
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Confirm deletion from MOVA dispatch records
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning detail card */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Destructive Action</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to delete manifest{' '}
            <strong className="text-white font-mono font-bold">{delivery.trackingCode}</strong> for{' '}
            <strong className="text-white">{delivery.customerName}</strong> ({delivery.destinationCity})?
          </p>
          <p className="text-rose-400/80 font-medium pt-1">
            This will permanently remove the record from MongoDB. This action cannot be reversed.
          </p>
        </div>

        {/* Error notification if API delete fails */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs">
            <p className="font-semibold">Failed to delete delivery</p>
            <p className="mt-0.5 text-rose-300/80">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
