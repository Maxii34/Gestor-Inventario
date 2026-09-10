type PageItem = number | 'ellipsis';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
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

export function Pagination({ page, totalPages, onPageChange, disabled = false, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);
  const baseButton =
    'rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Paginación" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={`${baseButton} border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`}
      >
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
        className={`${baseButton} border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50`}
      >
        Siguiente
      </button>
    </nav>
  );
}
