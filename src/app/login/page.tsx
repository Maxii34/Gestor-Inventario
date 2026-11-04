'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  LuBoxes,
  LuChartColumn,
  LuCircleHelp,
  LuEye,
  LuEyeOff,
  LuLockKeyhole,
  LuShieldCheck,
} from 'react-icons/lu';
import { BrandLockup, Button, Input } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { LoginNotice } from './LoginNotice';

const DESTACADOS = [
  {
    icono: LuBoxes,
    titulo: 'Stock en tiempo real',
    descripcion: 'Productos, movimientos y niveles de inventario siempre actualizados.',
  },
  {
    icono: LuChartColumn,
    titulo: 'Ventas y recaudación',
    descripcion: 'Registra ventas y consulta la recaudación por período al instante.',
  },
  {
    icono: LuShieldCheck,
    titulo: 'Acceso por roles',
    descripcion: 'Administradores y vendedores con permisos diferenciados.',
  },
];

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorEsSuspension, setErrorEsSuspension] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isSessionLoading, isAuthenticated, router]);

  useEffect(() => {
    const slugFromQuery = new URLSearchParams(window.location.search).get('slug');
    if (slugFromQuery) {
      setSlug(slugFromQuery);
      return;
    }
    const pendingSlug = window.sessionStorage.getItem('gestor.pendingSlug');
    if (pendingSlug) {
      setSlug(pendingSlug);
      window.sessionStorage.removeItem('gestor.pendingSlug');
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setErrorEsSuspension(false);
    setIsSubmitting(true);
    try {
      await login({ slug: slug.trim(), email, password });
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrorEsSuspension(err.status === 403);
      } else {
        setError('No se pudo iniciar sesión. Inténtalo nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section
        aria-label="Presentación del sistema"
        className="relative hidden overflow-hidden bg-zinc-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-zinc-800/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-zinc-800/40 blur-3xl"
        />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BrandLockup
              variant="dark"
              subtitle="Gestión inteligente de tu negocio"
            />
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h1 className="max-w-md text-3xl font-bold tracking-tight xl:text-4xl">
            Todo tu negocio, bajo control en un solo lugar.
          </h1>
          <ul className="mt-10 flex flex-col gap-6">
            {DESTACADOS.map((item, index) => (
              <motion.li
                key={item.titulo}
                className="flex gap-4"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.1 }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <item.icono aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.titulo}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{item.descripcion}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          className="relative text-xs text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          © {new Date().getFullYear()} StockNext. Todos los derechos reservados.
        </motion.p>
      </section>

      <main className="relative flex items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-zinc-100 blur-3xl"
        />
        <div className="relative flex min-h-full w-full max-w-sm flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <div className="lg:hidden">
            <BrandLockup
              size="sm"
              subtitle="Gestión inteligente de tu negocio"
            />
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
            Acceso al sistema
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
            Bienvenido de nuevo
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ingresa tus credenciales para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              label="Comercio"
              type="text"
              placeholder="mi-kiosco"
              autoComplete="organization"
              hint="Identificador (slug) que elegiste al registrar tu comercio."
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="usuario@empresa.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700">Contraseña</span>
              <span className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-10 text-sm font-normal text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
                <button
                  type="button"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setMostrarPassword((mostrar) => !mostrar)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-indigo-600"
                >
                  {mostrarPassword ? (
                    <LuEyeOff aria-hidden="true" size={17} />
                  ) : (
                    <LuEye aria-hidden="true" size={17} />
                  )}
                </button>
              </span>
            </label>
            <a
              href="#recuperar-clave"
              onClick={(event) => event.preventDefault()}
              className="-mt-2 self-end text-xs font-medium text-indigo-700 underline-offset-4 transition hover:text-indigo-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              ¿Olvidaste tu contraseña?
            </a>
            <Suspense fallback={null}>
              <LoginNotice />
            </Suspense>
            {error && (
              <p
                role="alert"
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  errorEsSuspension
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {error}
              </p>
            )}
            <p className="text-xs leading-5 text-zinc-500">
              El alta de comercios está a cargo del superadministrador de la plataforma.
            </p>
            <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-xs text-zinc-400" aria-hidden="true">
            <span className="h-px flex-1 bg-zinc-200" />
            <span>Acceso restringido al personal</span>
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <ul className="mt-4 flex flex-col gap-2.5">
            <li className="flex items-center gap-2 text-xs text-zinc-500">
              <LuLockKeyhole aria-hidden="true" size={14} className="shrink-0 text-zinc-400" />
              Tu sesión está protegida. No compartas tu contraseña.
            </li>
            <li className="flex items-center gap-2 text-xs text-zinc-500">
              <LuCircleHelp aria-hidden="true" size={14} className="shrink-0 text-zinc-400" />
              ¿Problemas para ingresar? Contacta a un administrador.
            </li>
          </ul>

          <p className="mt-8 text-center text-xs text-zinc-400">
            © {new Date().getFullYear()} StockNext · v0.1.0
          </p>
          <nav aria-label="Información legal" className="mt-3 flex justify-center gap-4">
            <a
              href="#politica-de-privacidad"
              onClick={(event) => event.preventDefault()}
              className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Política de privacidad
            </a>
            <a
              href="#terminos-y-condiciones"
              onClick={(event) => event.preventDefault()}
              className="text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Términos y condiciones
            </a>
          </nav>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
