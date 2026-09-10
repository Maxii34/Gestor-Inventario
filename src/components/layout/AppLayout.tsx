"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/productos": "Productos",
  "/categorias": "Categorías",
  "/movimientos": "Movimientos de stock",
  "/clientes": "Clientes",
  "/ventas": "Ventas",
  "/usuarios": "Usuarios",
};

function getSectionTitle(pathname: string): string {
  if (SECTION_TITLES[pathname]) return SECTION_TITLES[pathname];
  const match = Object.keys(SECTION_TITLES).find(
    (base) => pathname.startsWith(`${base}/`),
  );
  return match ? SECTION_TITLES[match] : "Gestor de Inventario";
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={getSectionTitle(pathname)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
