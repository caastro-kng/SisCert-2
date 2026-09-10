import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[90] flex flex-col gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.slice(-4).map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const tone = isSuccess
          ? 'border-emerald-700/70 bg-[#1B4332]'
          : isError
          ? 'border-red-700 bg-red-900'
          : 'border-gray-700 bg-gray-900';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 text-white shadow-2xl ${tone}`}
            role={isError ? 'alert' : 'status'}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
              {isError && <AlertCircle className="h-5 w-5 text-red-300" />}
              {!isSuccess && !isError && <Info className="h-5 w-5 text-amber-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs leading-5 text-white/80">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="-mr-1 -mt-1 rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={`Fechar notificação: ${toast.title}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
