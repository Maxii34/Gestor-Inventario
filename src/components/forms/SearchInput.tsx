'use client';

import { LuSearch } from 'react-icons/lu';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  label,
  id = 'busqueda',
  disabled = false,
  className = '',
}: SearchInputProps) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      {label && <span className="font-medium text-zinc-700">{label}</span>}
      <span className="relative block">
        <LuSearch
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          id={id}
          type="search"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
        />
      </span>
    </label>
  );
}
