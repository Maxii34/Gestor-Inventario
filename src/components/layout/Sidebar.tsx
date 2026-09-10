"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/ventas", label: "Ventas" },
  { href: "/usuarios", label: "Usuarios" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-zinc-900 text-zinc-300">
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <p className="text-base font-semibold tracking-tight text-white">
          Gestor de Inventario
        </p>
        <p className="mt-1 text-xs text-zinc-400">Panel administrativo</p>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-l-2 border-white bg-white/10 font-medium text-white"
                      : "border-l-2 border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void logout();
          }}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop / tablet horizontal amplia: sidebar fijo */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Móvil / tablet: drawer sobre el contenido */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navegación principal"
          className="fixed inset-0 z-40 lg:hidden"
        >  <div
            aria-hidden="true"
            className="absolute inset-0 bg-zinc-950/50"
            onClick={onCloseMobile}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <SidebarContent onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
