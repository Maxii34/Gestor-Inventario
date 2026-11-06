import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost'
  | 'action'
  | 'actionDanger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-700',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
  outline: 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  ghost: 'text-zinc-700 hover:bg-zinc-100',
  action:
    'border border-zinc-200 bg-white text-zinc-700 shadow-[0_1px_2px_rgba(24,24,27,0.08)] hover:-translate-y-px hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950 hover:shadow-[0_3px_8px_rgba(24,24,27,0.12)] active:translate-y-0 focus-visible:outline-zinc-700',
  actionDanger:
    'border border-zinc-200 bg-white text-zinc-600 shadow-[0_1px_2px_rgba(24,24,27,0.08)] hover:-translate-y-px hover:border-red-200 hover:bg-red-50 hover:text-red-700 hover:shadow-[0_3px_8px_rgba(127,29,29,0.12)] active:translate-y-0 focus-visible:outline-red-700',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  );
}
