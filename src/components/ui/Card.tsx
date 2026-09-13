import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  padding?: 'md' | 'lg';
  className?: string;
}

const BODY_PADDING = {
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ title, subtitle, actions, footer, children, padding = 'md', className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white shadow-md ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 p-4 pb-0">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      )}
      <div className={BODY_PADDING[padding]}>{children}</div>
      {footer && <div className="border-t border-zinc-100 px-4 py-3">{footer}</div>}
    </div>
  );
}
