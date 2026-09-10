'use client';

import { useEffect, type ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  onClose: () => void;
}

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  size = 'md',
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-xl bg-white shadow-lg ${SIZES[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="rounded-lg px-2 py-1 text-lg leading-none text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
