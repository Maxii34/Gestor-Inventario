'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LuArrowRight, LuShieldCheck } from 'react-icons/lu';
import { ApiError } from '@/lib/api/client';
import { plataformaTokenStorage } from '@/lib/auth/plataforma-storage';
import { iniciarSesionPlataforma } from '@/services/plataforma.service';

export default function PlataformaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (plataformaTokenStorage.getAccessToken()) router.replace('/plataforma');
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await iniciarSesionPlataforma(email.trim(), password);
      router.replace('/plataforma');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo iniciar sesión. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-28 h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-zinc-950">
            <LuShieldCheck aria-hidden="true" size={22} />
          </span>
          <div>
            <p className="font-semibold">Gestor de Inventario</p>
            <p className="text-xs text-zinc-400">Administración de plataforma</p>
          </div>
        </div>
        <div className="relative max-w-xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <LuShieldCheck aria-hidden="true" size={14} />
            Centro de control
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Toda la plataforma, bajo control.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
            Gestioná comercios, planes, pagos y actividad desde un único espacio seguro.
          </p>
        </div>
        <p className="relative text-xs text-zinc-500">
          Acceso restringido a superadministradores.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white lg:hidden">
            <LuShieldCheck aria-hidden="true" size={22} />
          </div>
          <p className="text-sm font-medium text-indigo-700">Panel de plataforma</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Ingresá con las credenciales de tu cuenta superadmin.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Correo electrónico</span>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="superadmin@tudominio.com"
                className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700">Contraseña</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Verificando…' : 'Entrar al panel'}
              {!isSubmitting && <LuArrowRight aria-hidden="true" size={16} />}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-zinc-400">
            Sesión independiente de los accesos de cada comercio.
          </p>
        </div>
      </section>
    </main>
  );
}
