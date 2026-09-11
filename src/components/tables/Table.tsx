import type { ReactNode } from 'react';

type TableAlign = 'left' | 'center' | 'right';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: TableAlign;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  emptyMessage?: string;
  caption?: string;
  className?: string;
}

const ALIGN: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function defaultCellValue<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '—';
}

export function Table<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = 'Sin registros para mostrar.',
  caption,
  className = '',
}: TableProps<T>) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {caption && <caption className="px-4 py-2 text-left text-xs text-zinc-500">{caption}</caption>}
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase ${ALIGN[column.align ?? 'left']} ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/70 bg-white">
          {data.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className="transition-colors last:border-b-0 hover:bg-zinc-50/80"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 align-middle text-zinc-700 ${ALIGN[column.align ?? 'left']} ${column.className ?? ''}`}
                >
                  {column.render ? column.render(row) : defaultCellValue(row, column.key)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
