interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
    </div>
  );
}
