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
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    accent: "border-sky-400 bg-sky-500/10 text-sky-200",
    accentIcon: "text-sky-400",
  },
  {
    href: "/productos",
    label: "Productos",
    icon: LuPackage,
    accent: "border-amber-400 bg-amber-500/10 text-amber-200",
    accentIcon: "text-amber-400",
  },
  {
    href: "/categorias",
    label: "Categorías",
    icon: LuTags,
    accent: "border-violet-400 bg-violet-500/10 text-violet-200",
    accentIcon: "text-violet-400",
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    icon: LuArrowUpDown,
    accent: "border-teal-400 bg-teal-500/10 text-teal-200",
    accentIcon: "text-teal-400",
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: LuUsers,
    accent: "border-blue-400 bg-blue-500/10 text-blue-200",
    accentIcon: "text-blue-400",
  },
  {
    href: "/ventas",
    label: "Ventas",
    icon: LuShoppingCart,
    accent: "border-emerald-400 bg-emerald-500/10 text-emerald-200",
    accentIcon: "text-emerald-400",
  },
  {
    href: "/usuarios",
    label: "Usuarios",
    icon: LuUserCog,
    accent: "border-rose-400 bg-rose-500/10 text-rose-200",
    accentIcon: "text-rose-400",
  },
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
                      ? `border-l-2 font-medium ${item.accent}`
                      : "border-l-2 border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={18}
                    className={`shrink-0 ${active ? item.accentIcon : "text-zinc-500"}`}
                  />
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
          className="flex w-full items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm text-red-300/80 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-200"
        >
          <LuLogOut aria-hidden="true" size={18} className="shrink-0 text-red-400" />
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
