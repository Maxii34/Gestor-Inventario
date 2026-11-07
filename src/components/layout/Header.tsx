'use client';

import { useEffect, useState } from 'react';
import { LuBuilding2, LuMenu } from 'react-icons/lu';
import { useAuth } from '@/context/AuthContext';
import { tokenStorage } from '@/lib/auth/storage';
import type { Comercio } from '@/types/auth';
import type { AuthRole } from '@/types/auth';

interface HeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

const ROL_ETIQUETA: Record<AuthRole, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
};

function getIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '··';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function Header({ title, onOpenMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const [comercio] = useState<Comercio | null>(() => tokenStorage.getStoredComercio());
  const [userInfoExpanded, setUserInfoExpanded] = useState(false);
  const nombre = user?.nombre ?? 'Usuario';
  const rol = user ? ROL_ETIQUETA[user.rol] : '···';

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const updateUserInfoVisibility = () => setUserInfoExpanded(desktopQuery.matches);

    updateUserInfoVisibility();
    desktopQuery.addEventListener('change', updateUserInfoVisibility);
    return () => desktopQuery.removeEventListener('change', updateUserInfoVisibility);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menú de navegación"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 lg:hidden"
          >
            <LuMenu aria-hidden="true" size={18} />
            Menú
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-zinc-900 md:text-lg">
              {title}
            </h1>
            <p className="hidden text-xs font-medium tracking-wide text-indigo-600 sm:block">
              StockNext
            </p>
          </div>
        </div>

        <div className="flex min-w-0 max-w-[55%] shrink items-center gap-2 sm:gap-3 md:max-w-[65%]">
          {comercio && (
            <>
              <div
                title={`${comercio.nombre} · ${comercio.slug}`}
                className="flex min-w-0 max-w-[38vw] items-center gap-2 lg:max-w-48 lg:rounded-xl lg:border lg:border-zinc-200/80 lg:bg-zinc-50 lg:px-2.5 lg:py-1.5"
              >
                <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 lg:flex">
                  <LuBuilding2 aria-hidden="true" size={15} />
                </span>
                <span className="min-w-0 lg:py-0.5">
                  <span className="hidden text-[10px] font-medium uppercase leading-3 tracking-wide text-zinc-400 lg:block">
                    Comercio
                  </span>
                  <span className="block truncate text-xs font-semibold leading-4 text-zinc-700">
                    {comercio.nombre}
                  </span>
                </span>
              </div>
              <span aria-hidden="true" className="hidden h-8 w-px bg-zinc-200 lg:block" />
            </>
          )}
          <div
            id="header-user-info"
            className={`${userInfoExpanded ? 'lg:block' : 'lg:hidden'} hidden min-w-0 text-right`}
          >
            <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
              <p className="truncate text-sm font-semibold leading-5 text-zinc-900">{nombre}</p>
              <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium leading-4 text-indigo-700">
                {rol}
              </span>
            </div>
            {user?.email && (
              <p className="hidden max-w-56 truncate text-xs leading-4 text-zinc-500 sm:block" title={user.email}>
                {user.email}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={userInfoExpanded ? 'Ocultar información del usuario' : 'Mostrar información del usuario'}
            aria-expanded={userInfoExpanded}
            aria-controls="header-user-info"
            onClick={() => setUserInfoExpanded((expanded) => !expanded)}
            className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-cyan-500 text-xs font-semibold text-white shadow-sm shadow-indigo-900/15 ring-2 ring-white hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:flex"
          >
            {getIniciales(nombre)}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
