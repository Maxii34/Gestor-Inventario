'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LuBoxes, LuChartColumn, LuCircleHelp, LuLockKeyhole, LuShieldCheck } from 'react-icons/lu';
import { Button, Checkbox, Input } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isSessionLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.replace('/dashboard');
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

        <div className="relative flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-zinc-950"
          >
            GI
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-base font-bold">Gestor de Inventario</p>
            <p className="text-xs text-zinc-400">Panel administrativo</p>
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
          © {new Date().getFullYear()} Gestor de Inventario. Todos los derechos reservados.
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
          <div className="flex items-center gap-3 lg:hidden">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white"
            >
              GI
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-900">Gestor de Inventario</p>
              <p className="text-xs text-zinc-500">Panel administrativo</p>
            </div>
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
              label="Email"
              type="email"
              placeholder="usuario@empresa.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <Checkbox label="Recordarme" />
              <button
                type="button"
                className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
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
            © {new Date().getFullYear()} Gestor de Inventario · v0.1.0
          </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
