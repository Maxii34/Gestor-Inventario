import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-zinc-700">{label}</span>}
      <input
        className={`rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900 ${className}`}
        {...props}
      />
    </label>
  );
}
