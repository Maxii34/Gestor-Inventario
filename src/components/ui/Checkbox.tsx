import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function Checkbox({ label, error, id, className = '', ...props }: CheckboxProps) {
  const checkboxId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <span className={`inline-flex flex-col gap-1 text-sm ${className}`}>
      <label
        htmlFor={checkboxId}
        className="inline-flex cursor-pointer items-center gap-2 text-zinc-700 hover:text-zinc-900"
      >
        <input
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
