"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuArrowDownRight,
  LuArrowRight,
  LuBookOpen,
  LuBug,
  LuCheck,
  LuClock3,
  LuCreditCard,
  LuExternalLink,
  LuLightbulb,
  LuMail,
  LuMessageCircle,
  LuPackage,
  LuShieldCheck,
  LuShoppingCart,
  LuUsers,
} from "react-icons/lu";
import { Card, PageHeader } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useSuscripcion } from "@/context/SuscripcionContext";
import { tokenStorage } from "@/lib/auth/storage";

const TELEFONO_WHATSAPP = "3816870337";
const EMAIL_SOPORTE = "exemaxi32@gmail.com";
const METADATOS_VACIOS = JSON.stringify({ comercioSlug: "", userAgent: "" });

const NOMBRE_PANTALLA: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/categorias": "Categorías",
  "/productos": "Productos",
  "/usuarios": "Usuarios",
  "/ventas": "Ventas",
  "/movimientos": "Control de stock",
  "/soporte": "Soporte",
};

const ETIQUETA_PLAN: Record<string, string> = {
  PRUEBA: "Prueba",
  MENSUAL: "Mensual",
  TRIMESTRAL: "Trimestral",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  VIGENTE: "Vigente",
  SIN_VENCIMIENTO: "Sin vencimiento",
  EN_GRACIA: "En gracia",
  VENCIDA: "Vencida",
};

const PREGUNTAS_FRECUENTES = [
  {
    titulo: "Cuenta y acceso",
    preguntas: [
      {
        pregunta: "¿Qué necesito para iniciar sesión?",
        respuesta: (
          <>
            El identificador de tu negocio, tu email y tu contraseña. El
            identificador es el nombre corto que te dimos al crear tu cuenta
            (por ejemplo: <code>kiosco-pepe</code>).
          </>
        ),
      },
      {
        pregunta: "Olvidé mi contraseña. ¿Qué hago?",
        respuesta: (
          <>
            Si sos vendedor, pedile a la persona administradora de tu negocio
            que te ayude. Si sos administrador, escribinos desde el canal de
            soporte: te generamos una contraseña temporal y el sistema te pide
            cambiarla apenas entrás. Por seguridad, nunca te vamos a pedir tu
            contraseña actual.
          </>
        ),
      },
      {
        pregunta: "¿Cómo cambio mi contraseña?",
        respuesta: (
          <>
            Desde tu perfil, en <strong>Cambiar contraseña</strong>. Tiene que
            tener entre 6 y 72 caracteres. Al cambiarla se cierran tus otras
            sesiones abiertas.
          </>
        ),
      },
      {
        pregunta: "¿Qué puede hacer cada rol?",
        respuesta: (
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Administrador:</strong> crea y edita productos y
              categorías, administra usuarios, anula ventas y ve las
              estadísticas.
            </li>
            <li>
              <strong>Vendedor:</strong> consulta categorías y productos,
              registra ventas, ve movimientos de stock y estadísticas. No
              modifica el catálogo ni anula ventas.
            </li>
          </ul>
        ),
      },
      {
        pregunta: "Me aparece «La cuenta está suspendida».",
        respuesta:
          "Tu cuenta fue suspendida y se cortó el acceso. Escribinos y lo revisamos juntos.",
      },
    ],
  },
  {
    titulo: "Ventas y stock",
    preguntas: [
      {
        pregunta: "¿Cómo anulo una venta?",
        respuesta: (
          <>
            Solo lo puede hacer un administrador. Entrá a{" "}
            <strong>Ventas</strong>, elegí la venta y tocá{" "}
            <strong>Anular</strong>. Te va a pedir un motivo. Al anularla, el
            stock de los productos vuelve automáticamente.
          </>
        ),
      },
      {
        pregunta: "Anulé una venta por error. ¿Se puede deshacer?",
        respuesta:
          "No. Una venta anulada no se puede reactivar. Registrá una venta nueva con los mismos productos.",
      },
      {
        pregunta: "¿Por qué no puedo eliminar un producto o una categoría?",
        respuesta:
          "Porque ya tiene movimientos o ventas, o porque hay productos asociados a esa categoría. Forman parte del historial y no se pueden borrar. Podés editar el producto, por ejemplo dejando su stock en 0.",
      },
      {
        pregunta: "¿Cómo ajusto el stock cuando no coincide con lo que tengo?",
        respuesta: (
          <>
            En <strong>Control de stock</strong>, registrá un ajuste. Queda
            guardado quién lo hizo y cuándo.
          </>
        ),
      },
      {
        pregunta: "¿Puedo vender sin cargar un cliente?",
        respuesta: "Sí. La venta de mostrador no pide datos del cliente.",
      },
    ],
  },
  {
    titulo: "Productos",
    preguntas: [
      {
        pregunta: "¿Cómo cargo un producto que compro por caja?",
        respuesta: (
          <>
            En el formulario del producto activá{" "}
            <strong>Lo compro por caja o pack</strong>. Cargás cuánto pagaste
            por la caja y cuántas unidades trae, y el sistema calcula el costo
            de cada unidad. La venta y el stock siguen siendo por unidad. Si el
            proveedor te cambia el precio, solo editás el precio de la caja.
          </>
        ),
      },
      {
        pregunta: "¿Puedo usar un lector de códigos de barras?",
        respuesta:
          "Sí. Los lectores USB o Bluetooth que funcionan como teclado (la mayoría) se usan sin instalar nada. En el producto cargás el código y en la pantalla de venta lo escaneás. Por ahora no se puede escanear con la cámara del celular.",
      },
      {
        pregunta: "Tengo muchos productos para cargar. ¿Me pueden ayudar?",
        respuesta:
          "Sí. Nosotros podemos cargarlos por vos, de a 50 por vez. Escribinos y te pasamos una planilla modelo.",
      },
    ],
  },
  {
    titulo: "Suscripción y pagos",
    preguntas: [
      {
        pregunta: "¿Cómo funciona la prueba gratuita?",
        respuesta: (
          <>
            Tenés [14] días para usar todo el sistema sin cargo. En el sistema
            ves cuántos días te quedan.
          </>
        ),
      },
      {
        pregunta: "¿Qué pasa cuando vence mi suscripción?",
        respuesta: (
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Tenés 3 días de gracia en los que todo sigue funcionando normal.
            </li>
            <li>
              Después pasa a modo solo lectura: podés ver y consultar tus datos,
              pero no registrar ventas ni modificar nada.
            </li>
            <li>Cuando renovás, todo vuelve a la normalidad al instante.</li>
          </ol>
        ),
      },
      {
        pregunta: "Pagué antes de que venza. ¿Pierdo los días que me sobraban?",
        respuesta:
          "No. Los meses que pagás se suman a los días que te quedaban.",
      },
      {
        pregunta: "¿Cómo pago?",
        respuesta: (
          <>
            Revisá los medios de pago y los datos para transferir en la sección{" "}
            <a
              className="font-semibold text-indigo-700 underline underline-offset-2"
              href="#suscripcion"
            >
              Suscripción y pagos
            </a>
            .
          </>
        ),
      },
    ],
  },
  {
    titulo: "Seguridad y datos",
    preguntas: [
      {
        pregunta: "¿Otros negocios pueden ver mis datos?",
        respuesta:
          "No. Cada negocio ve únicamente su propia información, y esa separación está verificada con pruebas automáticas.",
      },
      {
        pregunta: "¿Quién ve mis datos en el soporte?",
        respuesta: (
          <>
            Solo accedemos a lo necesario para atender tu consulta, y a pedido
            tuyo. Mirá la Política de privacidad para más detalle.
          </>
        ),
      },
    ],
  },
  {
    titulo: "Alcance del sistema",
    preguntas: [
      {
        pregunta: "¿StockNext emite facturas?",
        respuesta:
          "No. StockNext te ayuda a controlar stock, ventas y estadísticas, pero no emite comprobantes fiscales ni reemplaza tu sistema de facturación.",
      },
      {
        pregunta: "¿Necesito internet?",
        respuesta:
          "Sí. El sistema funciona en línea desde cualquier navegador, en computadora, tablet o celular.",
      },
    ],
  },
];

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(valor);
}

function obtenerNavegador(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return "Microsoft Edge";
  if (/Firefox\//.test(userAgent)) return "Mozilla Firefox";
  if (/Chrome\//.test(userAgent)) return "Google Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Navegador no identificado";
}

function obtenerDispositivo(userAgent: string): string {
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(userAgent)) return "Celular";
  return "Computadora";
}

function crearEnlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

function crearEnlaceEmail(asunto: string, mensaje: string): string {
  return `mailto:${EMAIL_SOPORTE}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
}

function suscribirMetadatos(): () => void {
  return () => {};
}

function obtenerMetadatos(): string {
  if (typeof window === "undefined") return METADATOS_VACIOS;
  return JSON.stringify({
    comercioSlug: tokenStorage.getStoredComercio()?.slug ?? "",
    userAgent: window.navigator.userAgent,
  });
}

function obtenerMetadatosServidor(): string {
  return METADATOS_VACIOS;
}

function fechaHoraActual(): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}

function abrirWhatsApp(mensaje: string): void {
  const mensajeConFecha = mensaje.replaceAll(
    "[fecha y hora al enviar]",
    fechaHoraActual(),
  );
  window.open(
    crearEnlaceWhatsApp(mensajeConFecha),
    "_blank",
    "noopener,noreferrer",
  );
}

function abrirEmail(asunto: string, mensaje: string): void {
  const mensajeConFecha = mensaje.replaceAll(
    "[fecha y hora al enviar]",
    fechaHoraActual(),
  );
  window.location.href = crearEnlaceEmail(asunto, mensajeConFecha);
}

function SeccionTitulo({
  id,
  etiqueta,
  titulo,
  descripcion,
}: {
  id: string;
  etiqueta: string;
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-xs font-semibold tracking-[0.16em] text-indigo-700 uppercase">
        {etiqueta}
      </p>
      <h2
        id={`${id}-titulo`}
        className="mt-1 text-xl font-bold tracking-tight text-zinc-900"
      >
        {titulo}
      </h2>
      {descripcion && (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
          {descripcion}
        </p>
      )}
    </div>
  );
}

export default function SoportePage() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { suscripcion } = useSuscripcion();
  const metadatos = JSON.parse(
    useSyncExternalStore(
      suscribirMetadatos,
      obtenerMetadatos,
      obtenerMetadatosServidor,
    ),
  ) as { comercioSlug: string; userAgent: string };
  const navegador = metadatos.userAgent
    ? obtenerNavegador(metadatos.userAgent)
    : "Se agrega al enviar";
  const dispositivo = metadatos.userAgent
    ? obtenerDispositivo(metadatos.userAgent)
    : "Se agrega al enviar";
  const identificadorComercio = metadatos.comercioSlug || "[identificador]";
  const nombreUsuario = user?.nombre ?? "[nombre]";
  const rolUsuario =
    user?.rol === "ADMIN"
      ? "Administrador"
      : user?.rol === "VENDEDOR"
        ? "Vendedor"
        : "[rol]";
  const estadoSuscripcion = suscripcion
    ? (ETIQUETA_ESTADO[suscripcion.estado] ?? suscripcion.estado)
    : "[estado de la suscripción]";
  const pantalla =
    NOMBRE_PANTALLA[pathname] ??
    (pathname.replaceAll("/", " ").trim() || "[pantalla]");
  const datosAutomaticos = [
    `Identificador del negocio: ${identificadorComercio}`,
    `Rol del usuario: ${rolUsuario}`,
    `Pantalla: ${pantalla}`,
    "Fecha y hora: [fecha y hora al enviar]",
    `Navegador: ${navegador}`,
    `Dispositivo: ${dispositivo}`,
    `Estado de la suscripción: ${estadoSuscripcion}`,
  ].join("\n");

  const mensajeProblema = [
    `Hola, soy ${nombreUsuario} del negocio ${identificadorComercio}.`,
    `Tengo un problema en ${pantalla}.`,
    "Estaba [qué estabas haciendo] y me pasó [qué pasó].",
    `Fecha y hora: [fecha y hora al enviar]. Navegador: ${navegador}.`,
    "",
    "Datos del sistema:",
    datosAutomaticos,
  ].join("\n");
  const mensajePago = [
    `Hola, soy ${nombreUsuario} del negocio ${identificadorComercio}.`,
    "Te envío el comprobante del pago de [___ meses].",
    "Monto: $[**]. Fecha: [**].",
  ].join("\n");
  const mensajeMejora = [
    `Hola, soy ${nombreUsuario} del negocio ${identificadorComercio}.`,
    "Me gustaría que el sistema [qué querés lograr].",
    "Lo necesito porque [para qué].",
  ].join("\n");
  const mensajePassword = [
    `Hola, soy ${nombreUsuario}, administrador del negocio ${identificadorComercio}.`,
    "Olvidé mi contraseña. Mi email de acceso es [email].",
  ].join("\n");

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-10">
      <PageHeader
        title="Centro de ayuda"
        description="Resolvé tus dudas o escribinos. Respondemos [en el día / dentro de las 24 hs hábiles]."
      />

      <section
        aria-label="Canales de contacto"
        className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"
      >
        <Card
          title="Cómo contactarnos"
          subtitle="Elegí el canal que te resulte más cómodo."
          className="border-zinc-200/80 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <LuMessageCircle
                  aria-hidden="true"
                  size={17}
                  className="text-indigo-600"
                />
                WhatsApp
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-700">
                +54 381-6870337
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Es la vía más rápida.
              </p>
              <a
                href={crearEnlaceWhatsApp(
                  "Hola, necesito ayuda con StockNext.",
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Escribir por WhatsApp{" "}
                <LuExternalLink aria-hidden="true" size={14} />
              </a>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <LuMail
                  aria-hidden="true"
                  size={17}
                  className="text-indigo-600"
                />
                Email
              </div>
              <a
                href={`mailto:${EMAIL_SOPORTE}`}
                className="mt-2 block break-all text-sm font-medium text-indigo-700 hover:text-indigo-900"
              >
                {EMAIL_SOPORTE}
              </a>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Para consultas y seguimiento.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <LuClock3
                  aria-hidden="true"
                  size={17}
                  className="text-indigo-600"
                />
                Horario
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-700">
                Lunes a viernes de 09:00 a 20:00 hs, hora de Argentina.
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Fuera de horario dejá tu mensaje y lo respondemos el siguiente
                día hábil.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
            <p className="text-xs font-semibold text-zinc-800">
              Prioridades de respuesta
            </p>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <p className="text-zinc-600">
                <span className="font-semibold text-zinc-800">Urgente</span> no
                podés entrar o no podés vender:{" "}
                <span className="font-medium">en menos de 2 hs hábiles</span>.
              </p>
              <p className="text-zinc-600">
                <span className="font-semibold text-zinc-800">
                  Consulta general o mejora:
                </span>{" "}
                dentro de las 24 hs hábiles.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Atajos de ayuda"
          subtitle="Encontrá rápido lo que necesitás."
          className="border-zinc-200/80 shadow-sm"
        >
          <nav aria-label="Atajos de ayuda" className="grid gap-2">
            {[
              {
                href: "#primeros-pasos",
                icon: LuBookOpen,
                label: "Primeros pasos",
                detail: "Configurá tu negocio",
              },
              {
                href: "#preguntas-frecuentes",
                icon: LuArrowRight,
                label: "Preguntas frecuentes",
                detail: "Respuestas rápidas",
              },
              {
                href: "#reportar-problema",
                icon: LuBug,
                label: "Reportar un problema",
                detail: "Contanos qué pasó",
              },
              {
                href: "#suscripcion",
                icon: LuCreditCard,
                label: "Suscripción y pagos",
                detail: "Plan, vencimiento y pagos",
              },
              {
                href: "#sugerir-mejora",
                icon: LuLightbulb,
                label: "Sugerir una mejora",
                detail: "Compartí tu idea",
              },
            ].map((atajo) => {
              const Icon = atajo.icon;
              return (
                <a
                  key={atajo.href}
                  href={atajo.href}
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition hover:border-zinc-200 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition group-hover:bg-white group-hover:text-indigo-700">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-800">
                      {atajo.label}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {atajo.detail}
                    </span>
                  </span>
                  <LuArrowDownRight
                    aria-hidden="true"
                    size={15}
                    className="text-zinc-400"
                  />
                </a>
              );
            })}
          </nav>
        </Card>
      </section>

      <section aria-labelledby="primeros-pasos-titulo" className="space-y-4">
        <SeccionTitulo
          id="primeros-pasos"
          etiqueta="Para empezar"
          titulo="Dejá tu negocio funcionando"
          descripcion="Seguí estos pasos para configurar tu catálogo, sumar a tu equipo y empezar a vender."
        />
        <Card className="border-zinc-200/80 shadow-sm">
          <ol className="grid gap-0 md:grid-cols-2">
            {[
              {
                titulo: "Creá tus categorías",
                descripcion:
                  "Agrupan tus productos (por ejemplo: Bebidas, Golosinas, Limpieza).",
                href: "/categorias",
                accion: "Ir a Categorías",
                icon: LuBookOpen,
              },
              {
                titulo: "Cargá tus productos",
                descripcion:
                  "Completá el costo, el precio de venta y el stock inicial. Si lo comprás por caja o pack, activá «Lo compro por caja»: cargás lo que pagaste por la caja y cuántas unidades trae, y el sistema calcula el costo por unidad.",
                href: "/productos",
                accion: "Ir a Productos",
                icon: LuPackage,
              },
              {
                titulo: "Sumá a tu equipo",
                descripcion:
                  "En Usuarios podés crear vendedores. Ellos pueden vender y consultar, pero no modificar el catálogo ni anular ventas.",
                href: "/usuarios",
                accion: "Ir a Usuarios",
                icon: LuUsers,
              },
              {
                titulo: "Registrá tu primera venta",
                descripcion:
                  "Elegí los productos, el método de pago (efectivo, transferencia o tarjeta) y confirmá. El stock se descuenta solo.",
                href: "/ventas",
                accion: "Ir a Ventas",
                icon: LuShoppingCart,
              },
              {
                titulo: "Mirá tus estadísticas",
                descripcion:
                  "Consultá cuánto vendiste en el período que elijas.",
                href: "/dashboard",
                accion: "Ver Dashboard",
                icon: LuArrowRight,
              },
            ].map((paso, index) => {
              const Icon = paso.icon;
              return (
                <li
                  key={paso.titulo}
                  className={`flex gap-4 border-zinc-100 py-5 first:pt-0 md:px-5 md:even:border-l md:even:pl-7 ${
                    index < 3 ? "md:border-b" : ""
                  } ${index === 4 ? "md:col-span-2 md:border-b-0" : ""}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">
                      <span className="mr-2 text-xs font-bold text-indigo-700">
                        {index + 1}.
                      </span>
                      {paso.titulo}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      {paso.descripcion}
                    </p>
                    <Link
                      href={paso.href}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      {paso.accion}{" "}
                      <LuArrowRight aria-hidden="true" size={13} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </section>

      <section
        aria-labelledby="preguntas-frecuentes-titulo"
        className="space-y-4"
      >
        <SeccionTitulo
          id="preguntas-frecuentes"
          etiqueta="Ayuda rápida"
          titulo="Preguntas frecuentes"
          descripcion="Respuestas a las consultas más comunes sobre el uso de StockNext."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {PREGUNTAS_FRECUENTES.map((grupo) => (
            <Card
              key={grupo.titulo}
              title={grupo.titulo}
              className="border-zinc-200/80 shadow-sm"
            >
              <div className="divide-y divide-zinc-100">
                {grupo.preguntas.map((item) => (
                  <details
                    key={item.pregunta}
                    className="group py-3 first:pt-0 last:pb-0"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-zinc-800 marker:content-none focus-visible:rounded focus-visible:outline-2 focus-visible:outline-indigo-600 [&::-webkit-details-marker]:hidden">
                      {item.pregunta}
                      <span
                        aria-hidden="true"
                        className="text-zinc-400 transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="pt-2 text-sm leading-6 text-zinc-600 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_strong]:font-semibold [&_strong]:text-zinc-700">
                      {item.respuesta}
                    </div>
                  </details>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="suscripcion-titulo" className="space-y-4">
        <SeccionTitulo
          id="suscripcion"
          etiqueta="Tu cuenta"
          titulo="Suscripción y pagos"
          descripcion="Consultá el estado de tu plan y encontrá los datos para renovar."
        />
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card
            title="Tu suscripción"
            subtitle="Información actual de tu cuenta."
            className="border-zinc-200/80 shadow-sm"
          >
            <dl className="divide-y divide-zinc-100">
              <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <dt className="text-sm text-zinc-500">Plan</dt>
                <dd className="text-right text-sm font-semibold text-zinc-800">
                  {suscripcion
                    ? (ETIQUETA_PLAN[suscripcion.plan] ?? suscripcion.plan)
                    : "[Prueba / Mensual / Trimestral]"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-zinc-500">Vigente hasta</dt>
                <dd className="text-right text-sm font-semibold text-zinc-800">
                  {suscripcion
                    ? suscripcion.accesoHasta
                      ? formatearFecha(suscripcion.accesoHasta)
                      : suscripcion.estado === "SIN_VENCIMIENTO"
                        ? "Sin vencimiento"
                        : "[fecha]"
                    : "[fecha]"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                <dt className="text-sm text-zinc-500">Estado</dt>
                <dd>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    {suscripcion ? (
                      <LuCheck aria-hidden="true" size={13} />
                    ) : null}
                    {estadoSuscripcion}
                  </span>
                </dd>
              </div>
            </dl>
            {suscripcion?.plan === "PRUEBA" &&
              suscripcion.diasRestantes !== null && (
                <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-800">
                  Te quedan {suscripcion.diasRestantes} días de prueba.
                </p>
              )}
          </Card>

          <Card
            title="Planes y cómo pagar"
            subtitle="Renová por transferencia y envianos el comprobante."
            className="border-zinc-200/80 shadow-sm"
          >
            <p className="text-sm font-semibold text-zinc-800">
              Planes y precios:{" "} <br />
              <span className="font-normal text-zinc-600">
                Mensual: $25.000 · Trimestral: $60.000 por 3 meses
                <span className="text-green-600 font-medium">
                  {" "}
                  (20% de descuento por lanzamiento, por tiempo limitado.).
                </span>
              </span>
            </p>
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
              <p className="text-sm font-semibold text-zinc-800">
                Transferencia bancaria
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Transferí a [CBU: 0000003100068491274768 / Alias: maxii.ordo35 / <br /> Titular: Maximiliano Ordoñez]. <br /> Después enviá el
                comprobante por [WhatsApp / email], indicando el{" "}
                <strong className="font-semibold text-zinc-800">
                  nombre de tu negocio
                </strong>
                . Acreditamos el pago [en el día / dentro de las 24 hs hábiles]
                y se extiende tu vencimiento.
              </p>
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-zinc-600">
              <LuCheck
                aria-hidden="true"
                size={16}
                className="mt-1 shrink-0 text-emerald-700"
              />
              Podés pagar varios meses juntos: se suman a tu vencimiento actual.
            </p>
            <a
              href={crearEnlaceWhatsApp(mensajePago)}
              onClick={(event) => {
                event.preventDefault();
                abrirWhatsApp(mensajePago);
              }}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <LuMessageCircle aria-hidden="true" size={16} /> Enviar
              comprobante
            </a>
          </Card>
        </div>
      </section>

      <section aria-labelledby="reportar-problema-titulo" className="space-y-4">
        <SeccionTitulo
          id="reportar-problema"
          etiqueta="Estamos para ayudarte"
          titulo="Reportar un problema"
          descripcion="Con estos datos podemos entender lo ocurrido y resolverlo más rápido."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <Card className="border-zinc-200/80 shadow-sm">
            <p className="text-sm font-semibold text-zinc-800">Contanos:</p>
            <ol className="mt-3 space-y-2.5">
              {[
                "Qué estabas haciendo (por ejemplo: «registrando una venta con 3 productos»).",
                "Qué esperabas que pasara.",
                "Qué pasó en realidad, con el mensaje de error si apareció.",
                "Cuándo ocurrió (fecha y hora aproximada).",
                "Una captura de pantalla, si podés.",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-zinc-600"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={crearEnlaceWhatsApp(mensajeProblema)}
                onClick={(event) => {
                  event.preventDefault();
                  abrirWhatsApp(mensajeProblema);
                }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <LuMessageCircle aria-hidden="true" size={16} /> Reportar por
                WhatsApp
              </a>
              <a
                href={crearEnlaceEmail(
                  "Reporte de problema en StockNext",
                  mensajeProblema,
                )}
                onClick={(event) => {
                  event.preventDefault();
                  abrirEmail(
                    "Reporte de problema en StockNext",
                    mensajeProblema,
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <LuMail aria-hidden="true" size={16} /> Reportar por email
              </a>
            </div>
          </Card>
          <Card
            title="Datos que agregamos al mensaje"
            subtitle="No hace falta que los busques ni los copies."
            className="border-zinc-200/80 shadow-sm"
          >
            <ul className="space-y-3">
              {[
                [
                  "Identificador del negocio y rol del usuario",
                  `${identificadorComercio} · ${rolUsuario}`,
                ],
                ["Pantalla y fecha/hora", `${pantalla} · se agrega al enviar`],
                ["Navegador y dispositivo", `${navegador} · ${dispositivo}`],
                ["Estado de la suscripción", estadoSuscripcion],
              ].map(([label, valor]) => (
                <li key={label} className="flex items-start gap-2.5">
                  <LuCheck
                    aria-hidden="true"
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />
                  <span className="text-sm leading-5 text-zinc-600">
                    {label}:{" "}
                    <strong className="font-semibold text-zinc-800">
                      {valor}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <LuShieldCheck
                aria-hidden="true"
                size={17}
                className="mt-0.5 shrink-0 text-amber-800"
              />
              <p className="text-xs leading-5 text-amber-900">
                Nunca incluyas ni compartas contraseñas o claves de sesión.
                Nosotros tampoco te las vamos a pedir.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section
        id="sugerir-mejora"
        aria-label="Sugerir una mejora"
        className="scroll-mt-24"
      >
        <Card
          title="¿Qué te haría la vida más fácil?"
          subtitle="Tus sugerencias nos ayudan a mejorar StockNext para tu negocio."
          className="border-zinc-200/80 shadow-sm"
          actions={
            <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 sm:flex">
              <LuLightbulb aria-hidden="true" size={19} />
            </span>
          }
        >
          <p className="text-sm leading-6 text-zinc-600">
            Contanos qué te gustaría lograr y para qué lo necesitás. Leemos cada
            propuesta.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={crearEnlaceWhatsApp(mensajeMejora)}
              onClick={(event) => {
                event.preventDefault();
                abrirWhatsApp(mensajeMejora);
              }}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <LuMessageCircle aria-hidden="true" size={16} /> Sugerir por
              WhatsApp
            </a>
            <a
              href={crearEnlaceEmail(
                "Sugerencia para StockNext",
                mensajeMejora,
              )}
              onClick={(event) => {
                event.preventDefault();
                abrirEmail("Sugerencia para StockNext", mensajeMejora);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <LuMail aria-hidden="true" size={16} /> Sugerir por email
            </a>
          </div>
        </Card>
      </section>

      <section
        aria-label="Otros mensajes para soporte"
        className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200">
            <LuMail aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-zinc-900">
              ¿Necesitás restablecer tu contraseña?
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Si sos administrador, contactanos por WhatsApp o email. Te
              ayudamos a recuperar el acceso de forma segura.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={crearEnlaceWhatsApp(mensajePassword)}
                onClick={(event) => {
                  event.preventDefault();
                  abrirWhatsApp(mensajePassword);
                }}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Pedir ayuda por WhatsApp
              </a>
              <span aria-hidden="true" className="text-zinc-300">
                ·
              </span>
              <a
                href={crearEnlaceEmail(
                  "Ayuda para restablecer contraseña",
                  mensajePassword,
                )}
                onClick={(event) => {
                  event.preventDefault();
                  abrirEmail(
                    "Ayuda para restablecer contraseña",
                    mensajePassword,
                  );
                }}
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Escribir por email
              </a>
            </div>
          </div>
        </div>
      </section>

      <p className="text-center text-xs leading-5 text-zinc-500">
        <LuShieldCheck
          aria-hidden="true"
          size={14}
          className="mr-1 inline-block align-text-bottom"
        />
        La información de tu negocio es privada. Nunca compartas tus claves de
        acceso.
      </p>
    </div>
  );
}
