'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LuBoxes, LuChartColumn, LuShieldCheck, LuStore } from 'react-icons/lu';
import { Button, Input } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { registrarComercio } from '@/services/comercios.service';

const BENEFICIOS = [
  {
    icono: LuBoxes,
    titulo: 'Tu propio espacio',
    descripcion: 'Productos, stock, clientes y ventas aislados de otros comercios.',
  },
  {
    icono: LuChartColumn,
    titulo: 'Control desde el primer día',
    descripcion: 'Empezá con tu catálogo y consultá la recaudación por período.',
  },
  {
    icono: LuShieldCheck,
    titulo: 'Administrador incluido',
    descripcion: 'El alta crea el comercio y su primer usuario administrador.',
  },
];

function validarFormulario(datos: {
  nombre: string;
  slug: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
}): string | null {
  if (!datos.nombre.trim()) return 'El nombre del comercio es obligatorio.';
  if (!datos.adminNombre.trim()) return 'El nombre del administrador es obligatorio.';
  if (!datos.adminEmail.trim()) return 'El email del administrador es obligatorio.';
  if (datos.adminPassword.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (datos.slug.trim() && !/^[a-z0-9-]+$/.test(datos.slug.trim())) {
    return 'El identificador solo admite minúsculas, números y guiones.';
  }
  return null;
}

export default function RegisterPage() {
  const { login, isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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

    const validacion = validarFormulario({
      nombre,
      slug,
      adminNombre,
      adminEmail,
      adminPassword,
    });
    if (validacion) {
      setError(validacion);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const resultado = await registrarComercio({
        nombre: nombre.trim(),
        ...(slug.trim() ? { slug: slug.trim() } : {}),
        adminNombre: adminNombre.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword,
      });
      try {
        await login({
          slug: resultado.comercio.slug,
          email: adminEmail.trim(),
          password: adminPassword,
        });
        router.replace('/dashboard');
      } catch {
        window.sessionStorage.setItem('gestor.pendingSlug', resultado.comercio.slug);
        router.replace('/login?aviso=registro');
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar el comercio. Inténtalo nuevamente.',
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
            Creá el espacio de tu comercio en minutos.
          </h1>
          <ul className="mt-10 flex flex-col gap-6">
            {BENEFICIOS.map((item, index) => (
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
        <div className="relative flex min-h-full w-full max-w-md flex-col justify-center">
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

            <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 lg:mt-0">
              <LuStore aria-hidden="true" size={13} />
              Nuevo comercio
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
              Registrá tu comercio
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Completá los datos del comercio y de su administrador.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Input
                label="Nombre del comercio"
                type="text"
                placeholder="Ej: Kiosco Don Pepe"
                autoComplete="organization"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
              <Input
                label="Identificador (slug)"
                type="text"
                placeholder="kiosco-don-pepe"
                autoComplete="off"
                maxLength={80}
                hint="Opcional. Si lo dejás vacío se genera desde el nombre."
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }
              />
              <Input
                label="Nombre del administrador"
                type="text"
                placeholder="Ej: Carlos Rodríguez"
                autoComplete="name"
                required
                value={adminNombre}
                onChange={(event) => setAdminNombre(event.target.value)}
              />
              <Input
                label="Email del administrador"
                type="email"
                placeholder="admin@comercio.com"
                autoComplete="email"
                required
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
              />
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Registrando…' : 'Crear comercio'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              ¿Ya tenés una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-zinc-900 underline-offset-2 hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>

            <div className="mt-8 flex items-center gap-3 text-xs text-zinc-400" aria-hidden="true">
              <span className="h-px flex-1 bg-zinc-200" />
              <span>El administrador podrá crear vendedores</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
