import type { Metadata } from 'next';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  LuArrowRight,
  LuBell,
  LuBoxes,
  LuCalculator,
  LuChartBar,
  LuCheck,
  LuChevronDown,
  LuClock3,
  LuCreditCard,
  LuDatabase,
  LuGlobe,
  LuMenu,
  LuMessageCircle,
  LuPackage,
  LuScanBarcode,
  LuShieldCheck,
  LuShoppingCart,
  LuUndo2,
  LuUpload,
  LuUsers,
  LuX,
} from 'react-icons/lu';
import { Captura } from '@/components/landing/Captura';
import { BrandLockup } from '@/components/ui/BrandLockup';
import {
  accesibilidad,
  ahorroTrimestral,
  beneficios,
  capturas,
  comoEmpezar,
  contacto,
  ctaFinal,
  encabezado,
  enlaceWhatsApp,
  enlaces,
  formatearPesos,
  funcionesDetalle,
  funcionesResumen,
  funcionesSeccion,
  heroe,
  limitaciones,
  navegacion,
  paraQuien,
  pie,
  planes,
  planesSeccion,
  preguntasFrecuentes,
  type FuncionalidadIcono,
} from '@/content/site';
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_ALT,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/seo';

const ICONOS_FUNCIONALIDADES: Record<FuncionalidadIcono, IconType> = {
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

const CONTENEDOR = 'mx-auto max-w-7xl px-4 sm:px-8';
const SECCION = 'scroll-mt-24 py-20 sm:py-24';
const ETIQUETA = 'text-sm font-semibold uppercase tracking-wide text-indigo-700';
const TITULO = 'mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl';
const PARRAFO = 'mt-4 text-base leading-7 text-zinc-700';
const TARJETA = 'revelar tarjeta sombra-tarjeta rounded-2xl border border-zinc-200 bg-white';
const BOTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold transition-colors';
const BOTON_PRIMARIO = `${BOTON} bg-indigo-600 text-white hover:bg-indigo-700`;
const BOTON_SECUNDARIO = `${BOTON} border border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50`;
const ICONO_CAJA =
  'flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700';
const PUNTO =
  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700';

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: new URL('/', SITE_URL).toString(),
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: new URL('/', SITE_URL).toString(),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: new URL('/opengraph-image', SITE_URL).toString(),
        alt: SITE_OG_ALT,
      },
    ],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL.toString(),
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'es-AR',
  offers: {
    '@type': 'Offer',
    price: planes[0].precio,
    priceCurrency: 'ARS',
    url: SITE_URL.toString(),
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <main className="min-h-screen overflow-x-clip bg-white pb-20 text-zinc-900 sm:pb-0">
        <a href="#contenido" className="saltar-contenido">
          {accesibilidad.saltarContenido}
        </a>
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className={`${CONTENEDOR} flex h-16 items-center justify-between gap-4`}>
          <Link
            href="/"
            aria-label={encabezado.ariaInicio}
            className="inline-flex min-h-11 items-center"
          >
            <BrandLockup size="sm" />
          </Link>
          <nav
            aria-label={encabezado.ariaNavegacion}
            className="hidden items-center gap-2 lg:flex"
          >
            {navegacion.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.etiqueta}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={enlaces.login}
              className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              {encabezado.ingresar}
            </Link>
            <a
              href={enlaces.whatsappProbar}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:inline-flex"
            >
              {encabezado.probar}
            </a>
            <details className="relative lg:hidden">
              <summary
                aria-label={encabezado.menu}
                className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-2xl border border-zinc-300 text-zinc-700 marker:content-none [&::-webkit-details-marker]:hidden"
              >
                <LuMenu aria-hidden="true" size={20} />
              </summary>
              <div className="sombra-tarjeta absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-4">
                <nav aria-label={encabezado.ariaNavegacion} className="grid gap-2">
                  {navegacion.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      {item.etiqueta}
                    </a>
                  ))}
                  <Link
                    href={enlaces.login}
                    className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100"
                  >
                    {encabezado.ingresar}
                  </Link>
                  <a
                    href={enlaces.whatsappProbar}
                    target="_blank"
                    rel="noreferrer"
                    className={`${BOTON_PRIMARIO} w-full px-4`}
                  >
                    {encabezado.probar}
                  </a>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section
        id="contenido"
        tabIndex={-1}
        className="relative isolate scroll-mt-24 overflow-hidden bg-white py-16 sm:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-indigo-50 via-white to-white"
        />
        <div
          className={`${CONTENEDOR} grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16`}
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {heroe.etiqueta}
            </span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              {heroe.titulo}{' '}
              <span className="text-indigo-600">{heroe.tituloDestacado}</span>
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-8 text-zinc-700">
              {heroe.descripcion}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={enlaces.whatsappProbar}
                target="_blank"
                rel="noreferrer"
                className={BOTON_PRIMARIO}
              >
                {heroe.ctaPrincipal}
                <LuArrowRight aria-hidden="true" size={16} />
              </a>
              <a href={enlaces.funciones} className={BOTON_SECUNDARIO}>
                {heroe.ctaSecundario}
              </a>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <LuCheck aria-hidden="true" size={16} />
              {heroe.nota}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-zinc-700">
              {heroe.senales.map((senal) => (
                <span key={senal} className="inline-flex items-center gap-2">
                  <LuCheck aria-hidden="true" className="text-emerald-600" size={16} />
                  {senal}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-16 sm:pb-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-br from-indigo-100 via-white to-emerald-50 blur-2xl"
            />
            <Captura
              {...capturas.heroEscritorio}
              marco="navegador"
              prioridad
              textoNoDisponible={capturas.noDisponible}
              className="w-full"
            />
            <div className="absolute -bottom-2 -left-2 w-32 -rotate-6 sm:-left-6 sm:w-40">
              <Captura
                {...capturas.heroCelular}
                marco="telefono"
                textoNoDisponible={capturas.noDisponible}
              />
            </div>
          </div>
        </div>
      </section>

      <section id={funcionesSeccion.id} className={`${SECCION} bg-zinc-50`}>
        <div className={CONTENEDOR}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{funcionesSeccion.etiqueta}</p>
            <h2 className={TITULO}>{funcionesSeccion.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>
              {funcionesSeccion.descripcion}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {funcionesResumen.map((funcionalidad) => {
              const Icono = ICONOS_FUNCIONALIDADES[funcionalidad.icono];

              return (
                <article key={funcionalidad.titulo} className={`${TARJETA} p-6`}>
                  <span className={ICONO_CAJA}>
                    <Icono aria-hidden="true" size={20} />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-zinc-950">
                    {funcionalidad.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {funcionalidad.descripcion}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
            {funcionesDetalle.map((funcionalidad, indice) => {
              const Icono = ICONOS_FUNCIONALIDADES[funcionalidad.icono];
              const invertida = indice % 2 === 1;

              return (
                <article
                  key={funcionalidad.titulo}
                  className="revelar grid items-center gap-8 md:grid-cols-2 md:gap-12"
                >
                  <div className={invertida ? 'md:order-2' : ''}>
                    <Captura
                      {...funcionalidad.captura}
                      marco="navegador"
                      textoNoDisponible={capturas.noDisponible}
                    />
                  </div>
                  <div className={invertida ? 'md:order-1' : ''}>
                    <span className={ICONO_CAJA}>
                      <Icono aria-hidden="true" size={20} />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
                      {funcionalidad.titulo}
                    </h3>
                    <p className={`${PARRAFO} max-w-prose`}>
                      {funcionalidad.descripcion}
                    </p>
                    <ul className="mt-6 grid gap-4">
                      {funcionalidad.puntos.map((punto) => (
                        <li
                          key={punto}
                          className="flex items-start gap-4 text-sm leading-6 text-zinc-700"
                        >
                          <span className={PUNTO}>
                            <LuCheck aria-hidden="true" size={13} />
                          </span>
                          {punto}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id={enlaces.beneficios.slice(1)} className={`${SECCION} bg-white`}>
        <div
          className={`${CONTENEDOR} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}
        >
          <div>
            <p className={ETIQUETA}>{beneficios.etiqueta}</p>
            <h2 className={TITULO}>{beneficios.titulo}</h2>
            <p className={`${PARRAFO} max-w-prose`}>{beneficios.descripcion}</p>
            <ul className="mt-8 grid gap-4">
              {beneficios.items.map((beneficio) => (
                <li
                  key={beneficio}
                  className="flex items-start gap-4 text-sm leading-6 text-zinc-700"
                >
                  <span className={PUNTO}>
                    <LuCheck aria-hidden="true" size={13} />
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
          <div className="sombra-tarjeta rounded-2xl bg-zinc-950 p-8 text-white sm:p-12">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
              <LuClock3 aria-hidden="true" size={24} />
            </span>
            <h3 className="mt-8 text-2xl font-semibold tracking-tight">
              {beneficios.panel.titulo}
            </h3>
            <p className="mt-4 text-base leading-7 text-zinc-300">
              {beneficios.panel.descripcion}
            </p>
            <div className="mt-8 flex items-start gap-4 border-t border-white/10 pt-6">
              <LuShieldCheck
                aria-hidden="true"
                className="shrink-0 text-emerald-400"
                size={20}
              />
              <p className="text-sm leading-6 text-zinc-300">{beneficios.panel.nota}</p>
            </div>
          </div>
        </div>
      </section>

      <section id={comoEmpezar.id} className={`${SECCION} bg-zinc-50`}>
        <div className={CONTENEDOR}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{comoEmpezar.etiqueta}</p>
            <h2 className={TITULO}>{comoEmpezar.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>
              {comoEmpezar.descripcion}
            </p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {comoEmpezar.pasos.map((paso, indice) => (
              <li key={paso.titulo} className={`${TARJETA} p-6`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                  {String(indice + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-lg font-semibold text-zinc-950">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{paso.descripcion}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id={paraQuien.id} className={`${SECCION} bg-white`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{paraQuien.etiqueta}</p>
            <h2 className={TITULO}>{paraQuien.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>{paraQuien.descripcion}</p>
          </div>
          <ul className="mt-12 flex flex-wrap justify-center gap-4">
            {paraQuien.rubros.map((rubro) => (
              <li
                key={rubro}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
              >
                {rubro}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm leading-6 text-zinc-700">
            {paraQuien.nota}
          </p>
        </div>
      </section>

      <section id={limitaciones.id} className={`${SECCION} bg-zinc-50`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{limitaciones.etiqueta}</p>
            <h2 className={TITULO}>{limitaciones.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>
              {limitaciones.descripcion}
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {limitaciones.items.map((item) => (
              <li
                key={item}
                className="tarjeta sombra-tarjeta flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                  <LuX aria-hidden="true" size={13} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id={planesSeccion.id} className={`${SECCION} bg-white`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{planesSeccion.etiqueta}</p>
            <h2 className={TITULO}>{planesSeccion.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>
              {planesSeccion.descripcion}
            </p>
          </div>
          <p className="mx-auto mt-8 w-fit rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-center text-sm font-semibold text-indigo-700">
            {planesSeccion.banda}
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {planes.map((plan) => (
              <article
                key={plan.id}
                className={`${TARJETA} p-8 ${
                  plan.destacado ? 'ring-2 ring-indigo-200' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      plan.destacado
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <LuCreditCard aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-950">{plan.nombre}</h3>
                    <p className="text-sm text-zinc-700">{plan.subtitulo}</p>
                  </div>
                </div>
                {plan.destacado && (
                  <span className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    {`${planesSeccion.ahorroEtiqueta} ${ahorroTrimestral.porcentaje}%`}
                  </span>
                )}
                <p className="mt-8 text-4xl font-bold tracking-tight text-zinc-950">
                  {formatearPesos(plan.precio)}
                  <span className="ml-2 text-sm font-medium text-zinc-700">
                    {plan.sufijoPrecio}
                  </span>
                </p>
                {plan.destacado && (
                  <div className="mt-2 grid gap-2 text-sm font-semibold text-indigo-700">
                    <p>
                      {`${planesSeccion.equivalentePrefijo} ${formatearPesos(
                        ahorroTrimestral.equivalenteMensual,
                      )} ${planesSeccion.equivalenteSufijo}`}
                    </p>
                    <p>
                      {`${planesSeccion.ahorroPesosPrefijo} ${formatearPesos(
                        ahorroTrimestral.monto,
                      )} ${planesSeccion.ahorroPesosSufijo}`}
                    </p>
                  </div>
                )}
                <p className="mt-4 text-sm leading-6 text-zinc-700">{plan.descripcion}</p>
                <a
                  href={enlaceWhatsApp(plan.mensaje)}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-8 w-full ${
                    plan.destacado ? BOTON_PRIMARIO : BOTON_SECUNDARIO
                  }`}
                >
                  {plan.cta}
                  <LuArrowRight aria-hidden="true" size={16} />
                </a>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="sombra-tarjeta rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-zinc-950">
                {planesSeccion.incluyeTitulo}
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {planesSeccion.incluye.map((item) => (
                  <li key={item} className="flex items-start gap-4 text-sm leading-6 text-zinc-700">
                    <span className={PUNTO}>
                      <LuCheck aria-hidden="true" size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sombra-tarjeta rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-zinc-950">
                {planesSeccion.condicionesTitulo}
              </h3>
              <ul className="mt-4 grid gap-4">
                {planesSeccion.condiciones.map((item) => (
                  <li key={item} className="flex items-start gap-4 text-sm leading-6 text-zinc-700">
                    <span className={PUNTO}>
                      <LuCheck aria-hidden="true" size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 text-center text-sm leading-6 text-zinc-700">
            {planesSeccion.nota}
          </p>
        </div>
      </section>

      <section id={preguntasFrecuentes.id} className={`${SECCION} bg-zinc-50`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className={ETIQUETA}>{preguntasFrecuentes.etiqueta}</p>
            <h2 className={TITULO}>{preguntasFrecuentes.titulo}</h2>
            <p className={`${PARRAFO} mx-auto max-w-prose`}>
              {preguntasFrecuentes.descripcion}
            </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2 md:items-start">
            {[
              { id: 'inicio', items: preguntasFrecuentes.items.slice(0, 7) },
              { id: 'pagos', items: preguntasFrecuentes.items.slice(7) },
            ].map((columna) => (
              <div key={columna.id} className="space-y-2.5">
                {columna.items.map((item) => (
                  <details
                    key={item.pregunta}
                    className="group revelar rounded-xl border border-zinc-200 bg-white px-4 py-1 shadow-sm"
                  >
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold text-zinc-950 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span>{item.pregunta}</span>
                      <LuChevronDown
                        aria-hidden="true"
                        className="shrink-0 text-zinc-600 transition-transform group-open:rotate-180"
                        size={16}
                      />
                    </summary>
                    <p className="pb-3 pr-1 text-sm leading-6 text-zinc-700">
                      {item.respuesta}
                    </p>
                  </details>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${SECCION} bg-white`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="sombra-tarjeta flex flex-col items-center rounded-2xl bg-linear-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
              <LuBoxes aria-hidden="true" size={24} />
            </span>
            <h2 className="mt-8 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              {ctaFinal.titulo}
            </h2>
            <p className="mt-4 max-w-prose text-base leading-7 text-zinc-300">
              {ctaFinal.descripcion}
            </p>
            <a
              href={enlaces.whatsappProbar}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-indigo-50"
            >
              {ctaFinal.boton}
              <LuArrowRight aria-hidden="true" size={16} />
            </a>
            <a
              href={enlaces.email}
              className="mt-4 inline-flex min-h-11 items-center text-sm text-zinc-300 underline decoration-zinc-500 underline-offset-4 transition-colors hover:text-white"
            >
              {ctaFinal.secundario}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <BrandLockup size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-700">
              {pie.descripcion}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-700">{pie.etiquetaLegal}</p>
            <ul className="mt-4 grid gap-2">
              <li>
                <a href={enlaces.terminos} className="inline-flex min-h-11 items-center text-sm text-zinc-700 transition-colors hover:text-indigo-700">
                  {pie.terminos}
                </a>
              </li>
              <li>
                <a href={enlaces.privacidad} className="inline-flex min-h-11 items-center text-sm text-zinc-700 transition-colors hover:text-indigo-700">
                  {pie.privacidad}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-700">
              {contacto.etiquetaWhatsapp}
            </p>
            <ul className="mt-4 grid gap-2">
              <li>
                <a
                  href={enlaces.whatsappConsulta}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-indigo-700"
                >
                  <LuMessageCircle aria-hidden="true" size={16} />
                  {contacto.ariaWhatsapp}
                </a>
              </li>
              <li>
                <Link
                  href={enlaces.login}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-900"
                >
                  {pie.ingresar}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200">
          <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-zinc-700 sm:px-8">
            {pie.copyright(new Date().getFullYear())}
          </p>
        </div>
      </footer>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-2 backdrop-blur sm:hidden">
          <a
            href={enlaces.whatsappProbar}
            target="_blank"
            rel="noreferrer"
            className={`${BOTON_PRIMARIO} w-full px-4`}
          >
            {pie.mobileCta}
            <LuArrowRight aria-hidden="true" size={16} />
          </a>
        </div>
      </main>
    </>
  );
}
