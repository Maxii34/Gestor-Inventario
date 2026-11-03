import {
  LuBookOpen,
  LuBug,
  LuCreditCard,
  LuLightbulb,
  LuMessageCircle,
} from "react-icons/lu";
import { Card, PageHeader } from "@/components";

const OPCIONES_AYUDA = [
  {
    titulo: "Ayuda sobre StockNext",
    descripcion:
      "Consultas sobre el funcionamiento y uso de las herramientas del sistema",
    icono: LuBookOpen,
    color: "bg-sky-50 text-sky-700 ring-sky-100",
    borde: "border-t-sky-400",
  },
  {
    titulo: "Reportar un problema",
    descripcion:
      "Informanos si encontraste un error o algo no está funcionando correctamente",
    icono: LuBug,
    color: "bg-rose-50 text-rose-700 ring-rose-100",
    borde: "border-t-rose-400",
  },
  {
    titulo: "Suscripción y pagos",
    descripcion:
      "Consultas sobre pagos, renovaciones, vencimientos y estado de tu suscripción",
    icono: LuCreditCard,
    color: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    borde: "border-t-emerald-400",
  },
  {
    titulo: "Sugerir una mejora",
    descripcion:
      "Compartí tus ideas y sugerencias para seguir mejorando StockNext",
    icono: LuLightbulb,
    color: "bg-amber-50 text-amber-700 ring-amber-100",
    borde: "border-t-amber-400",
  },
];

export default function SoportePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de ayuda"
        description="Estamos para ayudarte a resolver tus dudas y mejorar tu experiencia con StockNext"
      />

      <section
        aria-label="Temas de ayuda"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {OPCIONES_AYUDA.map((opcion) => {
          const Icono = opcion.icono;

          return (
            <Card
              key={opcion.titulo}
              title={opcion.titulo}
              className={`h-full border-zinc-200/80 border-t-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${opcion.borde}`}
              actions={
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${opcion.color}`}
                >
                  <Icono size={19} />
                </span>
              }
            >
              <p className="text-sm leading-6 text-zinc-600">
                {opcion.descripcion}
              </p>
            </Card>
          );
        })}
      </section>

      <section
        aria-labelledby="contacto-soporte-titulo"
        className="relative flex flex-col gap-5 overflow-hidden rounded-xl border border-indigo-900/10 bg-linear-to-br from-indigo-700 via-indigo-800 to-slate-900 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <h2
            id="contacto-soporte-titulo"
            className="text-base font-semibold text-white"
          >
            ¿Necesitás hablar con nosotros?
          </h2>
          <p className="mt-1 text-sm leading-6 text-indigo-100">
            Si necesitás asistencia personalizada, nuestro equipo de soporte
            está disponible para ayudarte
          </p>
        </div>
        <span
          aria-disabled="true"
          className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-indigo-800 shadow-sm"
        >
          <LuMessageCircle aria-hidden="true" size={17} />
          Contactar con soporte
        </span>
      </section>
    </div>
  );
}
