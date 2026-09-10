import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/productos', label: 'Productos' },
  { href: '/categorias', label: 'Categorías' },
  { href: '/movimientos', label: 'Movimientos de stock' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/ventas', label: 'Ventas' },
  { href: '/usuarios', label: 'Usuarios' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 md:flex">
      <p className="mb-4 text-sm font-bold text-zinc-900">Gestor de inventario</p>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
