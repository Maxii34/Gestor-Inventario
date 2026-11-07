'use client';

import { useEffect, type ReactNode } from 'react';
import { LuX } from 'react-icons/lu';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  size?: ModalSize;
  onClose: () => void;
}

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  wide: 'max-w-5xl',
};

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  headerActions,
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
        className={`relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-lg sm:max-h-[calc(100vh-2rem)] ${SIZES[size]}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
            {description && (
              <p className="mt-0.5 truncate text-sm text-zinc-500 sm:whitespace-normal sm:overflow-visible sm:text-clip">
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <LuX aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-100 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
