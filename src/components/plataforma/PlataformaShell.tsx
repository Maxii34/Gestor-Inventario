'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LuActivity,
  LuBuilding2,
  LuLayoutDashboard,
  LuLogOut,
  LuShieldCheck,
} from 'react-icons/lu';
import { plataformaTokenStorage } from '@/lib/auth/plataforma-storage';

const NAV_ITEMS = [
  { href: '/plataforma', label: 'Resumen', icon: LuLayoutDashboard },
  { href: '/plataforma/comercios', label: 'Comercios', icon: LuBuilding2 },
  { href: '/plataforma/auditoria', label: 'Auditoría', icon: LuActivity },
];

export function PlataformaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      if (!plataformaTokenStorage.getAccessToken()) {
        router.replace('/plataforma/login');
        return;
      }
      setEmail(plataformaTokenStorage.getEmail() ?? 'Superadministrador');
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  function logout(): void {
    plataformaTokenStorage.clear();
    router.replace('/plataforma/login');
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 lg:flex">
      <aside className="flex w-full shrink-0 flex-col bg-zinc-950 text-zinc-300 lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-950">
            <LuShieldCheck aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="font-semibold text-white">Gestor de Inventario</p>
            <p className="text-xs text-zinc-400">Control de plataforma</p>
          </div>
        </div>

        <nav aria-label="Navegación de plataforma" className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            Administración
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/plataforma'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-white/10 font-medium text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon aria-hidden="true" size={17} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-between border-t border-white/10 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Sesión activa
            </p>
            <p className="max-w-40 truncate text-xs text-zinc-300">{email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <LuLogOut aria-hidden="true" size={18} />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-5 backdrop-blur md:px-8">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {pathname.startsWith('/plataforma/auditoria')
                ? 'Auditoría'
                : pathname.startsWith('/plataforma/comercios')
                  ? 'Comercios'
                  : 'Resumen de plataforma'}
            </p>
            <p className="hidden text-xs text-zinc-500 sm:block">
              Gestión centralizada de comercios y suscripciones
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Superadmin
          </span>
        </header>
        <main className="mx-auto w-full max-w-360 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
