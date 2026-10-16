import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id?: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toast,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${
          isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
            : isError
            ? 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/40'
            : 'bg-slate-900/95 border-cyan-500/40 text-cyan-300 shadow-cyan-950/40'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
        </div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-medium text-slate-200 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
