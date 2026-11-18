export const marca = {
  nombre: 'StockNext',
  descripcion: 'Gestión simple para tu comercio',
} as const;

export const contacto = {
  telefonoWhatsapp: '3816870337',
  email: 'stocknext.dev@gmail.com',
  etiquetaWhatsapp: 'WhatsApp',
  ariaWhatsapp: 'Escribinos por WhatsApp',
} as const;

export const mensajesWhatsapp = {
  probar: 'Hola, quiero probar StockNext gratis durante 14 días.',
  consulta: 'Hola, quiero hacer una consulta sobre StockNext.',
  mensual: 'Hola, quiero consultar por el plan mensual de StockNext.',
  trimestral: 'Hola, quiero consultar por el plan trimestral de StockNext.',
} as const;

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${contacto.telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}`;
}

const appBase = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://codemaxdev-sigma.vercel.app'
).replace(/\/+$/, '');

export const enlaces = {
  login: '/login',
  funciones: '#funciones',
  beneficios: '#beneficios',
  comoEmpezar: '#como-empezar',
  paraQuien: '#para-quien',
  planes: '#planes',
  preguntas: '#preguntas',
  terminos: `${appBase}/terminos`,
  privacidad: `${appBase}/privacidad`,
  whatsappProbar: enlaceWhatsApp(mensajesWhatsapp.probar),
  whatsappConsulta: enlaceWhatsApp(mensajesWhatsapp.consulta),
  email: `mailto:${contacto.email}?subject=Consulta%20sobre%20StockNext`,
} as const;

export const encabezado = {
  ariaInicio: 'StockNext, inicio',
  ariaNavegacion: 'Navegación principal',
  menu: 'Menú',
  ingresar: 'Ingresar',
  probar: 'Probalo gratis',
} as const;

export const navegacion = [
  { etiqueta: 'Funciones', href: enlaces.funciones },
  { etiqueta: 'Beneficios', href: enlaces.beneficios },
  { etiqueta: 'Cómo empezar', href: enlaces.comoEmpezar },
  { etiqueta: 'Para quién es', href: enlaces.paraQuien },
  { etiqueta: 'Planes', href: enlaces.planes },
  { etiqueta: 'Preguntas', href: enlaces.preguntas },
] as const;

export const heroe = {
  etiqueta: 'Gestión simple para tu comercio',
  titulo: 'Tu negocio, más claro.',
  tituloDestacado: 'Todo en un solo lugar.',
  descripcion:
    'Controlá tus productos, ventas y stock desde una plataforma pensada para acompañar el día a día de tu comercio.',
  ctaPrincipal: 'Probalo 14 días gratis',
  ctaSecundario: 'Ver cómo funciona',
  nota: '14 días gratis, sin tarjeta',
  senales: ['Fácil de usar', 'Acceso desde computadora, tablet o celular'],
  ariaVistaPrevia: 'Vista ilustrativa de StockNext para el control de inventario',
} as const;

export const vistaPrevia = {
  subtitulo: 'Gestión simple',
  estado: 'Todo en orden',
  resumenEtiqueta: 'Resumen de tu comercio',
  resumenTitulo: 'Un vistazo a lo importante',
  productoEtiqueta: 'Productos',
  productoTitulo: 'Catálogo organizado',
  ventaEtiqueta: 'Ventas',
  ventaTitulo: 'Registro simple',
  stockTitulo: 'Control de stock',
  stockDetalle: 'Información siempre a mano',
  privacidad: 'La información de cada comercio es privada',
} as const;

export const capturas = {
  heroEscritorio: {
    src: '/capturas/panel-escritorio.webp',
    alt: 'Panel de StockNext en una computadora',
  },
  heroCelular: {
    src: '/capturas/ventas-celular.webp',
    alt: 'Ventas de StockNext en un celular',
  },
  ventas: {
    src: '/capturas/ventas.webp',
    alt: 'Registro de ventas de mostrador en StockNext',
  },
  productosCaja: {
    src: '/capturas/productos-caja.webp',
    alt: 'Costo por caja y costo por unidad en StockNext',
  },
  codigoBarras: {
    src: '/capturas/codigo-barras.webp',
    alt: 'Lectura de código de barras en StockNext',
  },
  stock: {
    src: '/capturas/stock.webp',
    alt: 'Stock y movimientos en StockNext',
  },
  estadisticas: {
    src: '/capturas/estadisticas.webp',
    alt: 'Estadísticas de recaudación y ventas por vendedor en StockNext',
  },
  equipo: {
    src: '/capturas/equipo.webp',
    alt: 'Equipo y roles en StockNext',
  },
  noDisponible: 'Captura no disponible',
} as const;

export const funcionesSeccion = {
  id: 'funciones',
  etiqueta: 'Una herramienta, todo conectado',
  titulo: 'Lo que necesitás para trabajar mejor',
  descripcion:
    'Menos tareas dispersas y más tiempo para atender y hacer crecer tu negocio.',
} as const;

export type FuncionalidadIcono =
  | 'productos'
  | 'stock'
  | 'ventas'
  | 'anulacion'
  | 'costo'
  | 'codigo'
  | 'estadisticas'
  | 'equipo'
  | 'suscripcion'
  | 'datos'
  | 'carga'
  | 'acceso';

export interface Funcionalidad {
  icono: FuncionalidadIcono;
  titulo: string;
  descripcion: string;
}

export const funcionalidades: Funcionalidad[] = [
  {
    icono: 'productos',
    titulo: 'Productos y categorías',
    descripcion:
      'Organizá tu catálogo por categorías y definí un stock mínimo por producto.',
  },
  {
    icono: 'stock',
    titulo: 'Stock y movimientos',
    descripcion:
      'Registrá entradas, salidas y ajustes de stock con el responsable de cada movimiento.',
  },
  {
    icono: 'ventas',
    titulo: 'Ventas de mostrador',
    descripcion:
      'Registrá ventas en efectivo, transferencia o tarjeta. El sistema guarda el método de pago elegido.',
  },
  {
    icono: 'anulacion',
    titulo: 'Anulación con motivo',
    descripcion:
      'Anulá una venta con un motivo y el stock se repone. La acción queda reservada al administrador.',
  },
  {
    icono: 'costo',
    titulo: 'Costo por caja',
    descripcion:
      'Cargá el costo de la caja y el sistema calcula el costo por unidad.',
  },
  {
    icono: 'codigo',
    titulo: 'Código de barras',
    descripcion:
      'Agregá productos a la venta con un lector de código de barras USB o Bluetooth.',
  },
  {
    icono: 'estadisticas',
    titulo: 'Estadísticas',
    descripcion:
      'Consultá la recaudación y las ventas por vendedor.',
  },
  {
    icono: 'equipo',
    titulo: 'Equipo y roles',
    descripcion:
      'Sumá integrantes con rol ADMIN o VENDEDOR y permisos según su responsabilidad.',
  },
  {
    icono: 'suscripcion',
    titulo: 'Aviso de suscripción',
    descripcion:
      'Recibí avisos sobre el estado de tu suscripción y su fecha de acceso.',
  },
  {
    icono: 'datos',
    titulo: 'Datos separados',
    descripcion:
      'Cada negocio accede solo a sus productos, ventas y movimientos.',
  },
  {
    icono: 'carga',
    titulo: 'Carga asistida',
    descripcion:
      'Si preferís, nuestro equipo carga tus productos de a 50.',
  },
  {
    icono: 'acceso',
    titulo: 'Acceso desde el navegador',
    descripcion:
      'Entrá desde computadora, tablet o celular, sin instalar una aplicación.',
  },
];

export const funcionesResumen = [
  funcionalidades[0],
  funcionalidades[2],
  funcionalidades[6],
  funcionalidades[7],
] as const;

export const beneficios = {
  etiqueta: 'Hecho para el día a día',
  titulo: 'Más orden para enfocarte en tu comercio',
  descripcion:
    'StockNext reúne las tareas esenciales de gestión en una experiencia clara, accesible y fácil de incorporar a tu rutina.',
  items: [
    'Menos tiempo buscando información en planillas.',
    'Stock y ventas organizados en un solo lugar.',
    'Acceso desde computadora, tablet o celular.',
    'Herramientas pensadas para el día a día de tu comercio.',
  ],
  panel: {
    titulo: 'Información que acompaña cada decisión',
    descripcion:
      'Revisá movimientos, consultá ventas y seguí tus productos con el historial de ventas y movimientos.',
    nota: 'Cada comercio accede a su propio espacio de trabajo.',
  },
} as const;

export const comoEmpezar = {
  id: 'como-empezar',
  etiqueta: 'Cómo empezar',
  titulo: 'Tres pasos para probar StockNext',
  descripcion: 'Sin instalaciones ni configuraciones complicadas.',
  pasos: [
    {
      titulo: 'Escribinos por WhatsApp',
      descripcion:
        'Contanos qué vendés y cuántos productos tenés. Coordinamos tu prueba de 14 días.',
    },
    {
      titulo: 'Cargá tus productos',
      descripcion:
        'Podés cargarlos vos o pedirnos que lo hagamos nosotros, de a 50.',
    },
    {
      titulo: 'Empezá a vender',
      descripcion:
        'Ingresá desde el navegador, registrá ventas y movimientos, y sumá a tu equipo.',
    },
  ],
} as const;

export const paraQuien = {
  id: 'para-quien',
  etiqueta: 'Para quién es',
  titulo: 'Pensado para comercios con stock y equipo',
  descripcion:
    'Si vendés productos y necesitás ordenar existencias, ventas y permisos, StockNext puede ayudarte.',
  rubros: [
    'Kioscos',
    'Almacenes',
    'Ferreterías',
    'Tiendas de ropa',
    'Perfumerías',
    'Pet shops',
    'Librerías',
    'Negocios de barrio',
  ],
  nota: 'Si vendés productos con stock y trabajás con un equipo chico o mediano, es para vos.',
} as const;

export const limitaciones = {
  id: 'lo-que-no-hace',
  etiqueta: 'Transparencia',
  titulo: 'Lo que StockNext no hace',
  descripcion:
    'Preferimos que sepas desde el principio qué cubre la plataforma y qué queda fuera.',
  items: [
    'No envía alertas automáticas de stock bajo.',
    'No gestiona clientes.',
    'No emite facturas electrónicas.',
    'No cobra con posnet: solo registra el método de pago elegido.',
    'No imprime tickets.',
    'No lee códigos de barras con la cámara del celular.',
    'No se conecta con balanzas.',
    'No administra varias sucursales.',
    'No es una app para descargar: se usa desde el navegador.',
    'No usa inteligencia artificial.',
  ],
} as const;

export interface Plan {
  id: 'mensual' | 'trimestral';
  nombre: string;
  subtitulo: string;
  precio: number;
  meses: number;
  sufijoPrecio: string;
  badge: string | null;
  descripcion: string;
  cta: string;
  mensaje: string;
  destacado: boolean;
}

export const planes: Plan[] = [
  {
    id: 'mensual',
    nombre: 'Plan mensual',
    subtitulo: 'Flexibilidad mes a mes',
    precio: 25000,
    meses: 1,
    sufijoPrecio: '/ mes',
    badge: null,
    descripcion: 'Inventario, ventas y gestión del equipo para tu comercio.',
    cta: 'Consultar plan mensual',
    mensaje: mensajesWhatsapp.mensual,
    destacado: false,
  },
  {
    id: 'trimestral',
    nombre: 'Plan trimestral',
    subtitulo: 'Tres meses con ahorro',
    precio: 60000,
    meses: 3,
    sufijoPrecio: '/ 3 meses',
    badge: '3 meses',
    descripcion: 'Las mismas herramientas de StockNext durante tres meses.',
    cta: 'Consultar plan trimestral',
    mensaje: mensajesWhatsapp.trimestral,
    destacado: true,
  },
];

export interface AhorroCalculado {
  porcentaje: number;
  monto: number;
  equivalenteMensual: number;
}

export function calcularAhorro(
  precioMensual: number,
  precioPeriodo: number,
  meses: number,
): AhorroCalculado {
  const costoEquivalente = precioMensual * meses;
  const monto = Math.max(costoEquivalente - precioPeriodo, 0);
  const porcentaje =
    costoEquivalente > 0 ? Math.round((monto / costoEquivalente) * 100) : 0;
  const equivalenteMensual = meses > 0 ? Math.round(precioPeriodo / meses) : 0;

  return { porcentaje, monto, equivalenteMensual };
}

const planMensual = planes.find((plan) => plan.id === 'mensual');
const planTrimestral = planes.find((plan) => plan.id === 'trimestral');

export const ahorroTrimestral = calcularAhorro(
  planMensual?.precio ?? 0,
  planTrimestral?.precio ?? 0,
  planTrimestral?.meses ?? 3,
);

export function formatearPesos(valor: number): string {
  return `$${new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(valor)}`;
}

export const planesSeccion = {
  id: 'planes',
  etiqueta: 'Planes simples',
  titulo: 'Elegí cómo empezar',
  descripcion:
    'Conocé las opciones disponibles y empezá con 14 días gratis.',
  banda: 'Probá 14 días gratis, sin tarjeta',
  ahorroEtiqueta: 'Ahorrás',
  equivalentePrefijo: 'Equivale a',
  equivalenteSufijo: '/ mes',
  ahorroPesosPrefijo: 'Ahorrás',
  ahorroPesosSufijo: 'en total',
  incluyeTitulo: 'Todos los planes incluyen todas las funciones',
  incluye: [
    'Productos y categorías',
    'Stock y movimientos con responsable',
    'Ventas con efectivo, transferencia o tarjeta (solo registra el método)',
    'Anulación con motivo y reposición de stock (solo administrador)',
    'Costo por caja y cálculo del costo por unidad',
    'Lector de código de barras USB o Bluetooth',
    'Estadísticas de recaudación y ventas por vendedor',
    'Equipo con roles ADMIN y VENDEDOR',
    'Aviso de suscripción',
    'Carga asistida de productos (de a 50)',
    'Acceso desde el navegador en computadora, tablet o celular',
    'Datos separados entre negocios',
  ],
  condicionesTitulo: 'Condiciones',
  condiciones: [
    'Pago por transferencia.',
    'Sin renovación automática ni permanencia.',
    'Los meses se suman.',
    '3 días de gracia y luego el sistema queda en solo lectura.',
  ],
  nota: 'Consultá por WhatsApp las condiciones vigentes y cómo empezar tu prueba gratuita.',
} as const;

export const funcionesDetalle = [
  {
    icono: 'ventas',
    titulo: funcionalidades[2].titulo,
    descripcion: funcionalidades[2].descripcion,
    puntos: [planesSeccion.incluye[2], planesSeccion.incluye[3]],
    captura: capturas.ventas,
  },
  {
    icono: 'costo',
    titulo: funcionalidades[4].titulo,
    descripcion: funcionalidades[4].descripcion,
    puntos: [planesSeccion.incluye[4]],
    captura: capturas.productosCaja,
  },
  {
    icono: 'codigo',
    titulo: funcionalidades[5].titulo,
    descripcion: funcionalidades[5].descripcion,
    puntos: [planesSeccion.incluye[5]],
    captura: capturas.codigoBarras,
  },
  {
    icono: 'stock',
    titulo: funcionalidades[1].titulo,
    descripcion: funcionalidades[1].descripcion,
    puntos: [planesSeccion.incluye[1], planesSeccion.incluye[0]],
    captura: capturas.stock,
  },
  {
    icono: 'estadisticas',
    titulo: funcionalidades[6].titulo,
    descripcion: funcionalidades[6].descripcion,
    puntos: [planesSeccion.incluye[6]],
    captura: capturas.estadisticas,
  },
  {
    icono: 'equipo',
    titulo: funcionalidades[7].titulo,
    descripcion: funcionalidades[7].descripcion,
    puntos: [planesSeccion.incluye[7]],
    captura: capturas.equipo,
  },
] as const;

export const preguntasFrecuentes = {
  id: 'preguntas',
  etiqueta: 'Preguntas frecuentes',
  titulo: 'Lo que suelen preguntarnos',
  descripcion: 'Si te queda alguna duda, escribinos por WhatsApp.',
  items: [
    {
      pregunta: '¿Necesito tarjeta para probar?',
      respuesta: 'No. La prueba es de 14 días gratis, sin tarjeta.',
    },
    {
      pregunta: '¿Cómo se paga?',
      respuesta:
        'El pago es por transferencia. No hay renovación automática ni permanencia.',
    },
    {
      pregunta: '¿Qué pasa cuando vence la suscripción?',
      respuesta:
        'Tenés 3 días de gracia. Después, el sistema queda en modo solo lectura hasta que renueves.',
    },
    {
      pregunta: '¿Puedo sumar meses?',
      respuesta: 'Sí, los meses se suman.',
    },
    {
      pregunta: '¿Funciona en el celular?',
      respuesta:
        'Sí. Se usa desde el navegador en computadora, tablet o celular. No es una app para descargar.',
    },
    {
      pregunta: '¿Puedo anular una venta?',
      respuesta:
        'Sí. Un administrador puede anularla con un motivo y el stock se repone.',
    },
    {
      pregunta: '¿Cobran con posnet o emiten factura?',
      respuesta:
        'No. Solo se registra el método de pago: efectivo, transferencia o tarjeta. No hay cobro con posnet ni facturación electrónica.',
    },
    {
      pregunta: '¿Los datos de cada negocio están separados?',
      respuesta:
        'Sí. Cada negocio accede solo a sus productos, ventas y movimientos.',
    },
    {
      pregunta: '¿Puedo cargar muchos productos?',
      respuesta:
        'Sí. Podés cargarlos vos o pedirnos carga asistida de a 50.',
    },
  ],
} as const;

export const ctaFinal = {
  titulo: '¿Listo para tener tu negocio más organizado?',
  descripcion:
    'Escribinos, probá StockNext durante 14 días y encontrá el plan que mejor se adapta a tu comercio.',
  boton: 'Probalo 14 días gratis',
  secundario: 'O escribinos por email',
} as const;

export const pie = {
  descripcion: 'Gestión simple para tu comercio.',
  etiquetaLegal: 'Legal',
  terminos: 'Términos y condiciones',
  privacidad: 'Política de privacidad',
  ingresar: 'Ingresar a mi cuenta',
  copyright: (anio: number) =>
    `© ${anio} StockNext. Todos los derechos reservados.`,
  mobileCta: 'Probalo gratis',
} as const;
