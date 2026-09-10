import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors';
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-700',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
