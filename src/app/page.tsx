import Link from 'next/link';
import {
  LuArrowRight,
  LuBoxes,
  LuCheck,
  LuClock3,
  LuCreditCard,
  LuPackage,
  LuShieldCheck,
  LuShoppingCart,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { BrandLockup } from '@/components/ui/BrandLockup';

const TELEFONO_WHATSAPP = '3816870337';
const MENSAJE_DEMO = encodeURIComponent(
  'Hola, quiero conocer StockNext y solicitar una demostración.',
);
const ENLACE_DEMO = `https://wa.me/${TELEFONO_WHATSAPP}?text=${MENSAJE_DEMO}`;

const FUNCIONALIDADES = [
  {
    icono: LuPackage,
    titulo: 'Productos y stock',
    descripcion:
      'Organizá tu catálogo, controlá existencias y recibí alertas para anticiparte a los faltantes.',
  },
  {
    icono: LuShoppingCart,
    titulo: 'Ventas ágiles',
    descripcion:
      'Registrá ventas, agregá productos por búsqueda o código de barras y consultá cada operación.',
  },
  {
    icono: LuTrendingUp,
    titulo: 'Un negocio más claro',
    descripcion:
      'Consultá indicadores y movimientos para entender cómo evoluciona tu comercio.',
  },
  {
    icono: LuUsers,
    titulo: 'Equipo organizado',
    descripcion:
      'Gestioná clientes y usuarios con permisos según las responsabilidades de cada persona.',
  },
];

const BENEFICIOS = [
  'Menos tiempo buscando información en planillas.',
  'Stock y ventas organizados en un solo lugar.',
  'Acceso desde computadora, tablet o celular.',
  'Herramientas pensadas para el día a día de tu comercio.',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" aria-label="StockNext, inicio">
            <BrandLockup size="sm" />
          </Link>
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex"
          >
            <a className="transition-colors hover:text-indigo-700" href="#funcionalidades">
              Funcionalidades
            </a>
            <a className="transition-colors hover:text-indigo-700" href="#beneficios">
              Beneficios
            </a>
            <a className="transition-colors hover:text-indigo-700" href="#planes">
              Planes
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              Ingresar
            </Link>
            <a
              href={ENLACE_DEMO}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:inline-flex"
            >
              Pedir una demo
            </a>
          </div>
        </div>
      </header>

      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-cyan-100/70 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Gestión simple para tu comercio
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Tu negocio, más claro.{' '}
              <span className="text-indigo-600">Todo en un solo lugar.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Controlá tus productos, ventas y stock desde una plataforma pensada para
              acompañar el día a día de tu comercio.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={ENLACE_DEMO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/15 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Solicitar una demostración
                <LuArrowRight aria-hidden="true" size={17} />
              </a>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                Ya tengo una cuenta
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <LuCheck aria-hidden="true" className="text-emerald-600" size={16} />
                Fácil de usar
              </span>
              <span className="inline-flex items-center gap-2">
                <LuCheck aria-hidden="true" className="text-emerald-600" size={16} />
                Acceso desde cualquier lugar
              </span>
            </div>
          </div>

          <div
            aria-label="Vista ilustrativa de StockNext para el control de inventario"
            className="relative mx-auto w-full max-w-xl"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-100 via-cyan-50 to-white blur-xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-indigo-950/10">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-950 px-5 py-4">
                <BrandLockup variant="dark" size="sm" subtitle="Gestión inteligente" />
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  Todo en orden
                </span>
              </div>
              <div className="grid gap-4 bg-zinc-50 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Resumen de tu comercio</p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                    Un vistazo a lo importante
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <LuBoxes aria-hidden="true" size={18} />
                    </span>
                    <p className="mt-4 text-xs text-zinc-500">Productos</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">Catálogo organizado</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <LuShoppingCart aria-hidden="true" size={18} />
                    </span>
                    <p className="mt-4 text-xs text-zinc-500">Ventas</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">Registro simple</p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <LuPackage aria-hidden="true" size={19} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">Control de stock</p>
                        <p className="mt-0.5 text-xs text-zinc-500">Información siempre a mano</p>
                      </div>
                    </div>
                    <LuArrowRight aria-hidden="true" className="text-zinc-400" size={18} />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500">
                <LuShieldCheck aria-hidden="true" className="text-emerald-600" size={15} />
                La información de cada comercio es privada
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="scroll-mt-24 bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              Una herramienta, todo conectado
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Lo que necesitás para trabajar mejor
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              Menos tareas dispersas y más tiempo para atender y hacer crecer tu negocio.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FUNCIONALIDADES.map((funcionalidad) => (
              <article
                key={funcionalidad.titulo}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <funcionalidad.icono aria-hidden="true" size={20} />
                </span>
                <h3 className="mt-5 text-base font-semibold text-zinc-950">
                  {funcionalidad.titulo}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {funcionalidad.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              Hecho para el día a día
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Más orden para enfocarte en tu comercio
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-zinc-600">
              StockNext reúne las tareas esenciales de gestión en una experiencia clara,
              accesible y fácil de incorporar a tu rutina.
            </p>
            <ul className="mt-7 grid gap-4">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3 text-sm text-zinc-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <LuCheck aria-hidden="true" size={13} />
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-zinc-950 p-7 text-white shadow-xl shadow-zinc-950/15 sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-cyan-300">
              <LuClock3 aria-hidden="true" size={23} />
            </span>
            <h3 className="mt-7 text-2xl font-semibold tracking-tight">
              Información que acompaña cada decisión
            </h3>
            <p className="mt-3 leading-7 text-zinc-300">
              Revisá movimientos, consultá ventas y seguí tus productos con una vista
              completa de la actividad del negocio.
            </p>
            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
              <LuShieldCheck aria-hidden="true" className="shrink-0 text-emerald-400" size={20} />
              <p className="text-sm text-zinc-300">
                Cada comercio accede a su propio espacio de trabajo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className="scroll-mt-24 bg-indigo-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              Planes simples
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Elegí cómo empezar
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              Conocé las opciones disponibles y escribinos para coordinar una demostración.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <LuCreditCard aria-hidden="true" size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-950">Plan mensual</h3>
                  <p className="text-sm text-zinc-500">Flexibilidad mes a mes</p>
                </div>
              </div>
              <p className="mt-7 text-3xl font-bold tracking-tight text-zinc-950">
                $25.000
                <span className="ml-1 text-sm font-medium text-zinc-500">/ mes</span>
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Inventario, ventas y gestión del equipo para tu comercio.
              </p>
              <a
                href={ENLACE_DEMO}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                Consultar plan mensual
                <LuArrowRight aria-hidden="true" size={16} />
              </a>
            </article>
            <article className="relative rounded-2xl border border-indigo-300 bg-white p-7 shadow-lg shadow-indigo-950/5">
              <span className="absolute right-5 top-5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                3 meses
              </span>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <LuCreditCard aria-hidden="true" size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-950">Plan trimestral</h3>
                  <p className="text-sm text-zinc-500">Un período más largo</p>
                </div>
              </div>
              <p className="mt-7 text-3xl font-bold tracking-tight text-zinc-950">
                $60.000
                <span className="ml-1 text-sm font-medium text-zinc-500">/ 3 meses</span>
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Todas las herramientas de StockNext durante tres meses.
              </p>
              <a
                href={ENLACE_DEMO}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Consultar plan trimestral
                <LuArrowRight aria-hidden="true" size={16} />
              </a>
            </article>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
            Consultá por WhatsApp las condiciones vigentes y la disponibilidad de una
            demostración.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
            <LuBoxes aria-hidden="true" size={23} />
          </span>
          <h2 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Listo para tener tu negocio más organizado?
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-zinc-300">
            Escribinos, conocé StockNext y encontrá el plan que mejor se adapta a tu
            comercio.
          </p>
          <a
            href={ENLACE_DEMO}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-50"
          >
            Contactar y pedir una demo
            <LuArrowRight aria-hidden="true" size={17} />
          </a>
          <a
            href="mailto:stocknext.dev@gmail.com?subject=Consulta%20sobre%20StockNext"
            className="mt-4 text-sm text-zinc-300 underline decoration-zinc-500 underline-offset-4 transition-colors hover:text-white"
          >
            O escribinos por email
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandLockup size="sm" />
          <p>© {new Date().getFullYear()} StockNext. Gestión simple para tu comercio.</p>
          <Link
            href="/login"
            className="font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
          >
            Ingresar a mi cuenta
          </Link>
        </div>
      </footer>
    </main>
  );
}
