import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <h3 className="mb-2 text-sm font-semibold text-zinc-900">{title}</h3>}
      {children}
    </div>
  );
}
