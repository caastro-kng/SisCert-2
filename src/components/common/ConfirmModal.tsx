import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
  children?: React.ReactNode;
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  children,
  isLoading = false,
  confirmDisabled = false,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => cancelButtonRef.current?.focus(), 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const buttonColors = {
    primary: 'bg-[#1B4332] hover:bg-[#2D5A47] text-white focus:ring-[#1B4332]/30',
    danger: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-600/30',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30',
  };

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        id="confirm-modal-content"
        className="relative w-full overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:max-w-md sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="p-5 pr-12 sm:p-6 sm:pr-14">
          <button
            id="btn-modal-close"
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className={`shrink-0 rounded-lg border p-2.5 ${
              variant === 'danger' ? 'border-red-200 bg-red-50 text-red-700' :
              variant === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' :
              'border-emerald-200 bg-emerald-50 text-[#1B4332]'
            }`}>
              {variant === 'danger' || variant === 'warning' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <h3 id={titleId} className="text-base font-bold text-gray-900 sm:text-lg">{title}</h3>
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
            </div>
          </div>

          {children && <div className="pt-4 text-sm text-gray-700">{children}</div>}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            ref={cancelButtonRef}
            id="btn-modal-cancel"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-10 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            id="btn-modal-confirm"
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-xs transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-45 ${buttonColors[variant]}`}
          >
            {isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /><span>Processando...</span></> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
