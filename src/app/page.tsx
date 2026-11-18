import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  LuArrowRight,
  LuBell,
  LuBoxes,
  LuCalculator,
  LuChartBar,
  LuCheck,
  LuClock3,
  LuCreditCard,
  LuDatabase,
  LuGlobe,
  LuPackage,
  LuScanBarcode,
  LuShieldCheck,
  LuShoppingCart,
  LuUndo2,
  LuUpload,
  LuUsers,
} from 'react-icons/lu';
import { BrandLockup } from '@/components/ui/BrandLockup';
import {
  beneficios,
  ctaFinal,
  encabezado,
  enlaces,
  formatearPesos,
  funcionalidades,
  funcionesSeccion,
  heroe,
  navegacion,
  pie,
  planes,
  planesSeccion,
  type Funcionalidad,
  vistaPrevia,
} from '@/content/site';

const ICONOS_FUNCIONALIDADES: Record<Funcionalidad['icono'], IconType> = {
  productos: LuPackage,
  stock: LuBoxes,
  ventas: LuShoppingCart,
  anulacion: LuUndo2,
  costo: LuCalculator,
  codigo: LuScanBarcode,
  estadisticas: LuChartBar,
  equipo: LuUsers,
  suscripcion: LuBell,
  datos: LuDatabase,
  carga: LuUpload,
  acceso: LuGlobe,
};

const NAVEGACION_ACTUAL = [navegacion[0], navegacion[1], navegacion[4]];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" aria-label={encabezado.ariaInicio}>
            <BrandLockup size="sm" />
          </Link>
          <nav
            aria-label={encabezado.ariaNavegacion}
            className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex"
          >
            {NAVEGACION_ACTUAL.map((item) => (
              <a
                key={item.href}
                className="transition-colors hover:text-indigo-700"
                href={item.href}
              >
                {item.etiqueta}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={enlaces.login}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              {encabezado.ingresar}
            </Link>
            <a
              href={enlaces.whatsappProbar}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:inline-flex"
            >
              {encabezado.probar}
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
              {heroe.etiqueta}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              {heroe.titulo}{' '}
              <span className="text-indigo-600">{heroe.tituloDestacado}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              {heroe.descripcion}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={enlaces.whatsappProbar}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/15 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                {heroe.ctaPrincipal}
                <LuArrowRight aria-hidden="true" size={17} />
              </a>
              <a
                href={enlaces.funciones}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                {heroe.ctaSecundario}
              </a>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <LuCheck aria-hidden="true" size={16} />
              {heroe.nota}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
              {heroe.senales.map((senal) => (
                <span key={senal} className="inline-flex items-center gap-2">
                  <LuCheck aria-hidden="true" className="text-emerald-600" size={16} />
                  {senal}
                </span>
              ))}
            </div>
          </div>

          <div
            aria-label={heroe.ariaVistaPrevia}
            className="relative mx-auto w-full max-w-xl"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-100 via-cyan-50 to-white blur-xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-indigo-950/10">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-950 px-5 py-4">
                <BrandLockup variant="dark" size="sm" subtitle={vistaPrevia.subtitulo} />
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  {vistaPrevia.estado}
                </span>
              </div>
              <div className="grid gap-4 bg-zinc-50 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    {vistaPrevia.resumenEtiqueta}
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                    {vistaPrevia.resumenTitulo}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <LuBoxes aria-hidden="true" size={18} />
                    </span>
                    <p className="mt-4 text-xs text-zinc-500">
                      {vistaPrevia.productoEtiqueta}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {vistaPrevia.productoTitulo}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <LuShoppingCart aria-hidden="true" size={18} />
                    </span>
                    <p className="mt-4 text-xs text-zinc-500">
                      {vistaPrevia.ventaEtiqueta}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {vistaPrevia.ventaTitulo}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <LuPackage aria-hidden="true" size={19} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {vistaPrevia.stockTitulo}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {vistaPrevia.stockDetalle}
                        </p>
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
                {vistaPrevia.privacidad}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id={funcionesSeccion.id} className="scroll-mt-24 bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              {funcionesSeccion.etiqueta}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {funcionesSeccion.titulo}
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              {funcionesSeccion.descripcion}
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {funcionalidades.map((funcionalidad) => {
              const Icono = ICONOS_FUNCIONALIDADES[funcionalidad.icono];

              return (
                <article
                  key={funcionalidad.titulo}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icono aria-hidden="true" size={20} />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-zinc-950">
                    {funcionalidad.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {funcionalidad.descripcion}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id={enlaces.beneficios.slice(1)} className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              {beneficios.etiqueta}
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {beneficios.titulo}
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-zinc-600">
              {beneficios.descripcion}
            </p>
            <ul className="mt-7 grid gap-4">
              {beneficios.items.map((beneficio) => (
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
              {beneficios.panel.titulo}
            </h3>
            <p className="mt-3 leading-7 text-zinc-300">
              {beneficios.panel.descripcion}
            </p>
            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
              <LuShieldCheck aria-hidden="true" className="shrink-0 text-emerald-400" size={20} />
              <p className="text-sm text-zinc-300">{beneficios.panel.nota}</p>
            </div>
          </div>
        </div>
      </section>

      <section id={planesSeccion.id} className="scroll-mt-24 bg-indigo-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
              {planesSeccion.etiqueta}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {planesSeccion.titulo}
            </h2>
            <p className="mt-4 leading-7 text-zinc-600">
              {planesSeccion.descripcion}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {planes.map((plan) => (
              <article
                key={plan.id}
                className={`relative rounded-2xl border bg-white p-7 ${
                  plan.destacado
                    ? 'border-indigo-300 shadow-lg shadow-indigo-950/5'
                    : 'border-zinc-200 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      plan.destacado
                        ? 'bg-cyan-50 text-cyan-700'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    <LuCreditCard aria-hidden="true" size={19} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-zinc-950">{plan.nombre}</h3>
                    <p className="text-sm text-zinc-500">{plan.subtitulo}</p>
                  </div>
                </div>
                <p className="mt-7 text-3xl font-bold tracking-tight text-zinc-950">
                  {formatearPesos(plan.precio)}
                  <span className="ml-1 text-sm font-medium text-zinc-500">
                    {plan.sufijoPrecio}
                  </span>
                </p>
                <p className="mt-2 text-sm text-zinc-600">{plan.descripcion}</p>
                <a
                  href={enlaces.whatsappConsulta}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    plan.destacado
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {plan.cta}
                  <LuArrowRight aria-hidden="true" size={16} />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
            {planesSeccion.nota}
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
            <LuBoxes aria-hidden="true" size={23} />
          </span>
          <h2 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {ctaFinal.titulo}
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-zinc-300">
            {ctaFinal.descripcion}
          </p>
          <a
            href={enlaces.whatsappProbar}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-50"
          >
            {ctaFinal.boton}
            <LuArrowRight aria-hidden="true" size={17} />
          </a>
          <a
            href={enlaces.email}
            className="mt-4 text-sm text-zinc-300 underline decoration-zinc-500 underline-offset-4 transition-colors hover:text-white"
          >
            {ctaFinal.secundario}
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandLockup size="sm" />
          <p>{pie.copyright(new Date().getFullYear())}</p>
          <Link
            href={enlaces.login}
            className="font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
          >
            {pie.ingresar}
          </Link>
        </div>
      </footer>
    </main>
  );
}
