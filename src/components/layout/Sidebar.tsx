"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuArrowUpDown,
  LuLayoutDashboard,
  LuLogOut,
  LuPackage,
  LuShoppingCart,
  LuTags,
  LuUserCog,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/productos", label: "Productos", icon: LuPackage },
  { href: "/categorias", label: "Categorías", icon: LuTags },
  { href: "/movimientos", label: "Movimientos", icon: LuArrowUpDown },
  { href: "/clientes", label: "Clientes", icon: LuUsers },
  { href: "/ventas", label: "Ventas", icon: LuShoppingCart },
  { href: "/usuarios", label: "Usuarios", icon: LuUserCog },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-zinc-900 text-zinc-300">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-5 pt-6">
        <div>
          <p className="text-base font-semibold tracking-tight text-white">
            Gestor de Inventario
          </p>
          <p className="mt-1 text-xs text-zinc-400">Panel administrativo</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <LuX aria-hidden="true" size={18} />
          </button>
        )}
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-l-2 border-white bg-white/10 font-medium text-white"
                      : "border-l-2 border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon aria-hidden="true" size={18} className="shrink-0" />
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
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <LuLogOut aria-hidden="true" size={18} className="shrink-0" />
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
            <SidebarContent onNavigate={onCloseMobile} onClose={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
