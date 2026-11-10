"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuArrowUpDown,
  LuArrowUpRight,
  LuBanknote,
  LuBoxes,
  LuChevronDown,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuLogOut,
  LuPackage,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuShoppingCart,
  LuTags,
  LuUserCog,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { MODULO_CLIENTES } from "@/lib/config";
import { BrandLockup } from "@/components/ui/BrandLockup";
import type { AuthRole } from "@/types/auth";

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
    label: "Control de stock",
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
    href: "/ventas/nueva",
    label: "Nueva venta",
    icon: LuBanknote,
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

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ROLE_LABELS: Record<AuthRole, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SidebarContent({
  onNavigate,
  onClose,
  collapsed = false,
  onToggleCollapse,
  mobileOnly = false,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOnly?: boolean;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [userInfoExpanded, setUserInfoExpanded] = useState(false);
  const isAdmin = user?.rol === "ADMIN";

  return (
    <div className="flex h-full flex-col bg-zinc-900 text-zinc-300">
      <div
        className={`flex items-center border-b border-white/10 ${
          collapsed ? "flex-col gap-3 px-2 py-4" : "justify-between gap-4 px-5 pb-5 pt-6"
        }`}
      >
        {collapsed ? (
          <span
            role="img"
            aria-label="StockNext"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-950/20"
          >
            <LuBoxes aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        ) : (
          <BrandLockup
            variant="dark"
            size="sm"
            subtitle="Gestión inteligente de tu negocio"
          />
        )}
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
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className={`rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white ${
              collapsed ? "" : "shrink-0"
            }`}
          >
            {collapsed ? (
              <LuPanelLeftOpen aria-hidden="true" size={18} />
            ) : (
              <LuPanelLeftClose aria-hidden="true" size={18} />
            )}
          </button>
        )}
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.filter(
            (item) =>
              (item.href !== "/usuarios" || isAdmin) &&
              (item.href !== "/clientes" || MODULO_CLIENTES),
          ).map((item) => {
            const active = isActive(pathname, item.href, item.href === "/ventas");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg py-2 text-sm transition-colors ${
                    collapsed ? "justify-center px-0" : "gap-2.5 px-3"
                  } ${
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
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 bg-zinc-950/20 p-3">
        {mobileOnly && user && (
          <div className="mb-3 border-b border-white/10 pb-3">
            <button
              type="button"
              aria-expanded={userInfoExpanded}
              aria-controls="mobile-sidebar-user-info"
              onClick={() => setUserInfoExpanded((expanded) => !expanded)}
              className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 text-xs font-semibold text-white ring-2 ring-white/10">
                {getInitials(user.nombre)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-200">Mi cuenta</span>
                <span className="block text-xs text-zinc-500">
                  {userInfoExpanded ? "Ocultar información" : "Ver información"}
                </span>
              </span>
              <LuChevronDown
                aria-hidden="true"
                size={18}
                className={`shrink-0 text-zinc-500 transition-transform ${userInfoExpanded ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id="mobile-sidebar-user-info"
              className={`${userInfoExpanded ? "block" : "hidden"} mt-2 rounded-lg bg-white/5 px-3 py-2`}
            >
              <p className="truncate text-sm font-semibold text-white">{user.nombre}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{ROLE_LABELS[user.rol]}</p>
              <p className="mt-1 break-all text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
        )}
        <Link
          href="/soporte"
          onClick={onNavigate}
          aria-current={isActive(pathname, "/soporte") ? "page" : undefined}
          aria-label={collapsed ? "Soporte" : undefined}
          title={collapsed ? "Soporte" : undefined}
          className={`group flex items-center rounded-xl border p-2.5 transition-colors ${
            collapsed ? "justify-center" : "gap-3"
          } ${
            isActive(pathname, "/soporte")
              ? "border-indigo-400/30 bg-indigo-500/10 text-white"
              : "border-white/5 bg-white/3 text-zinc-300 hover:border-indigo-400/25 hover:bg-indigo-500/10"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500/20 to-cyan-500/20 text-indigo-300 ring-1 ring-white/10 transition-colors group-hover:text-cyan-200">
            <LuLifeBuoy aria-hidden="true" size={18} />
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-5">Centro de ayuda</span>
                <span className="block text-xs leading-4 text-zinc-500 group-hover:text-zinc-400">
                  Estamos para ayudarte
                </span>
              </span>
              <LuArrowUpRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-zinc-500 transition-colors group-hover:text-cyan-300"
              />
            </>
          )}
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void logout();
          }}
          aria-label={collapsed ? "Cerrar sesión" : undefined}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`mt-2 flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-200 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LuLogOut aria-hidden="true" size={18} className="shrink-0 text-zinc-500" />
          {!collapsed && "Cerrar sesión"}
        </button>
        {!collapsed && (
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-zinc-600">
            <span>© {new Date().getFullYear()} StockNext</span>
            <span className="rounded-full border border-white/5 px-2 py-0.5 text-zinc-500">
              v1.0.0
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  desktopCollapsed: boolean;
  onToggleDesktop: () => void;
}

export function Sidebar({
  mobileOpen,
  onCloseMobile,
  desktopCollapsed,
  onToggleDesktop,
}: SidebarProps) {
  return (
    <>
      {/* Desktop / tablet horizontal amplia: sidebar fijo */}
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 lg:block ${
          desktopCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen">
          <SidebarContent
            collapsed={desktopCollapsed}
            onToggleCollapse={onToggleDesktop}
          />
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
            <SidebarContent onNavigate={onCloseMobile} onClose={onCloseMobile} mobileOnly />
          </aside>
        </div>
      )}
    </>
  );
}
