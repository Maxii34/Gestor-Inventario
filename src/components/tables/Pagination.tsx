'use client';

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type PageItem = number | 'ellipsis';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  compactOnMobile?: boolean;
}

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: PageItem[] = [1];
  if (page > 3) items.push('ellipsis');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    items.push(p);
  }
  if (page < totalPages - 2) items.push('ellipsis');
  items.push(totalPages);
  return items;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = '',
  compactOnMobile = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);
  const baseButton =
    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Paginación" className={`flex items-center gap-1.5 ${className}`}>
      {compactOnMobile && (
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuChevronLeft aria-hidden="true" size={18} />
          </button>
          <span
            aria-current="page"
            className="min-w-16 whitespace-nowrap text-center text-sm font-medium tabular-nums text-zinc-700"
          >
            {page} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      )}
      <div className={`${compactOnMobile ? 'hidden sm:flex' : 'flex'} flex-wrap items-center gap-1.5`}>
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`${baseButton} inline-flex items-center gap-1 border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`}
        >
          <LuChevronLeft aria-hidden="true" size={16} />
          Anterior
        </button>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-sm text-zinc-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={
                item === page
                  ? `${baseButton} border-zinc-900 bg-zinc-900 font-medium text-white`
                  : `${baseButton} border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`
              }
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${baseButton} inline-flex items-center gap-1 border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`}
        >
          Siguiente
          <LuChevronRight aria-hidden="true" size={16} />
        </button>
      </div>
    </nav>
  );
}
