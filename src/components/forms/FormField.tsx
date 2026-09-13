import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 text-sm ${className}`}>
      <label htmlFor={htmlFor} className="font-medium text-zinc-700">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
      {!error && hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </div>
  );
}
