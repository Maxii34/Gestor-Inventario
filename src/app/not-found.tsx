import type { Metadata } from 'next';
import Link from 'next/link';
import { LuArrowLeft, LuMessageCircle, LuSearch } from 'react-icons/lu';
import { BrandLockup } from '@/components/ui/BrandLockup';
import { encabezado, enlaces, pie } from '@/content/site';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscás no existe o cambió de lugar.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          <Link
            href="/"
            aria-label={encabezado.ariaInicio}
            className="inline-flex min-h-11 items-center"
          >
            <BrandLockup size="sm" />
          </Link>
          <Link
            href={enlaces.login}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
          >
            Ingresar
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid w-full items-center gap-10 md:grid-cols-[1fr_0.8fr] md:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">
              Error 404
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Esta página no existe.
            </h1>
            <p className="mt-4 max-w-prose text-base leading-7 text-zinc-700">
              Puede que el enlace esté mal escrito o que la página haya cambiado
              de lugar. Volvé al inicio, ingresá a tu cuenta o escribinos y te
              ayudamos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <LuArrowLeft aria-hidden="true" size={16} />
                Volver al inicio
              </Link>
              <a
                href={enlaces.whatsappProbar}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                <LuMessageCircle aria-hidden="true" size={16} />
                Consultar por WhatsApp
              </a>
            </div>

            <nav
              aria-label="Enlaces útiles"
              className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium"
            >
              <Link href={enlaces.login} className="py-2 text-zinc-600 hover:text-indigo-700">
                Ingresar a mi cuenta
              </Link>
              <Link href="/#funciones" className="py-2 text-zinc-600 hover:text-indigo-700">
                Ver funciones
              </Link>
              <Link href="/#preguntas" className="py-2 text-zinc-600 hover:text-indigo-700">
                Preguntas frecuentes
              </Link>
            </nav>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-950/5"
          >
            <div className="absolute inset-6 rounded-[1.5rem] border border-dashed border-indigo-200" />
            <div className="relative text-center">
              <LuSearch className="mx-auto text-indigo-600" size={44} />
              <p className="mt-3 text-7xl font-black tracking-tighter text-zinc-950">
                404
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Página no encontrada
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{pie.copyright(new Date().getFullYear())}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
            <Link
              href={enlaces.terminos}
              className="inline-flex min-h-11 items-center transition-colors hover:text-indigo-700"
            >
              {pie.terminos}
            </Link>
            <Link
              href={enlaces.privacidad}
              className="inline-flex min-h-11 items-center transition-colors hover:text-indigo-700"
            >
              {pie.privacidad}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
