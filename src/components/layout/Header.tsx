'use client';

import { useEffect, useRef, useState } from 'react';
import { LuBuilding2, LuMail, LuMenu, LuShieldCheck } from 'react-icons/lu';
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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const nombre = user?.nombre ?? 'Usuario';
  const rol = user ? ROL_ETIQUETA[user.rol] : '···';

  useEffect(() => {
    if (!userInfoExpanded) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserInfoExpanded(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserInfoExpanded(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userInfoExpanded]);

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
          <div ref={userMenuRef} className="relative hidden shrink-0 lg:block">
            <button
              type="button"
              aria-label={
                userInfoExpanded ? 'Ocultar información del usuario' : 'Mostrar información del usuario'
              }
              aria-expanded={userInfoExpanded}
              aria-controls="header-user-info"
              onClick={() => setUserInfoExpanded((expanded) => !expanded)}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-cyan-500 text-xs font-semibold text-white shadow-sm shadow-indigo-900/15 ring-2 ring-white transition-[filter,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {getIniciales(nombre)}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </button>

            <div
              id="header-user-info"
              role="region"
              aria-label="Información del usuario"
              aria-hidden={!userInfoExpanded}
              className={`absolute right-0 top-full z-30 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 ring-1 ring-black/5 transition-[opacity,transform,visibility] duration-150 ease-out ${
                userInfoExpanded
                  ? 'visible translate-y-0 opacity-100'
                  : 'invisible -translate-y-1 opacity-0'
              }`}
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 bg-linear-to-br from-indigo-50/80 via-white to-cyan-50/60 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-cyan-500 text-sm font-semibold text-white shadow-sm shadow-indigo-900/15 ring-1 ring-white/60">
                  {getIniciales(nombre)}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    Cuenta
                  </p>
                  <p className="truncate text-sm font-semibold leading-5 text-zinc-900" title={nombre}>
                    {nombre}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 px-4 py-3">
                {user?.email && (
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                      <LuMail aria-hidden="true" size={14} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                        Email
                      </dt>
                      <dd
                        className="truncate text-xs font-medium leading-4 text-zinc-700"
                        title={user.email}
                      >
                        {user.email}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <LuShieldCheck aria-hidden="true" size={14} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      Rol
                    </dt>
                    <dd className="mt-0.5">
                      <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                        {rol}
                      </span>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
