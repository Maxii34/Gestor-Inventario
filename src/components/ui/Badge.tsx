import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
}

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-2 py-px text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ children, tone = 'neutral', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full font-medium ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
