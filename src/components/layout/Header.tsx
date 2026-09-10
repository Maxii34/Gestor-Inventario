interface HeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export function Header({ title, onOpenMobileMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú de navegación"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 lg:hidden"
          >
            Menú
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-zinc-900 md:text-lg">
              {title}
            </h1>
            <p className="hidden text-xs text-zinc-500 sm:block">
              Gestor de Inventario
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight text-zinc-900">
              Usuario Demo
            </p>
            <p className="text-xs leading-tight text-zinc-500">Administrador</p>
          </div>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white"
          >
            UD
          </span>
        </div>
      </div>
    </header>
  );
}
