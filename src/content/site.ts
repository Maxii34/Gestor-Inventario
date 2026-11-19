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

export const accesibilidad = {
  saltarContenido: 'Saltar al contenido',
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
  senales: [
  'Gestión simple y organizada',
  'Para computadora, tablet y celular',
],
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
    src: '/img/home.png',
    alt: 'Panel principal de StockNext en una computadora',
  },
  heroCelular: {
    src: '/img/homecelu.png',
    alt: 'Panel principal de StockNext en un celular',
  },
  productosUnidad: {
    src: '/img/cargaproductoxunidad.png',
    alt: 'Carga de un producto por unidad en StockNext',
  },
  ventas: {
    src: '/img/nuevaventa.png',
    alt: 'Registro de una nueva venta en StockNext',
  },
  productosCaja: {
    src: '/img/cargaxcaja24.png',
    alt: 'Costo por caja de 24 unidades en StockNext',
  },
  codigoBarras: {
    src: '/img/cargaconbarra.png',
    alt: 'Carga de un producto con código de barras en StockNext',
  },
  stock: {
    src: '/img/registrostock.png',
    alt: 'Registro de stock y movimientos en StockNext',
  },
  estadisticas: {
    src: '/img/personalstatus.png',
    alt: 'Estadísticas de ventas por vendedor en StockNext',
  },
  equipo: {
    src: '/img/equipoyroles.png',
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
      'Organizá tus productos por categorías, consultá sus precios y establecé niveles mínimos de stock.',
  },
  {
    icono: 'stock',
    titulo: 'Stock y movimientos',
    descripcion:
      'Registrá entradas, salidas y ajustes de stock, con seguimiento de quién realiza cada operación.',
  },
  {
    icono: 'ventas',
    titulo: 'Ventas de mostrador',
    descripcion:
      'Registrá ventas y sus medios de pago: efectivo, transferencia o tarjeta.',
  },
  {
    icono: 'anulacion',
    titulo: 'Anulación con motivo',
    descripcion:
      'Anulá ventas indicando el motivo y recuperá automáticamente las unidades en stock. Disponible para administradores.',
  },
  {
    icono: 'costo',
    titulo: 'Costo por caja',
    descripcion:
      'Registrá el costo de los paquetes y calculá automáticamente el costo de cada unidad.',
  },
  {
    icono: 'codigo',
    titulo: 'Código de barras',
    descripcion:
      'Agilizá la carga de productos en las ventas utilizando lectores de códigos de barras USB o Bluetooth.',
  },
  {
    icono: 'estadisticas',
    titulo: 'Estadísticas',
    descripcion:
      'Consultá la recaudación y las ventas registradas por cada vendedor.',
  },
  {
    icono: 'equipo',
    titulo: 'Equipo y roles',
    descripcion:
      'Incorporá vendedores y administradores, con permisos según el rol asignado.',
  },
  {
    icono: 'suscripcion',
    titulo: 'Aviso de suscripción',
    descripcion:
      'Consultá el estado de tu suscripción y recibí avisos sobre su vigencia.',
  },
  {
    icono: 'datos',
    titulo: 'Datos separados',
    descripcion:
      'Cada comercio tiene acceso independiente a sus propios productos, ventas y movimientos.',
  },
  {
    icono: 'carga',
    titulo: 'Carga asistida',
    descripcion:
      '	¿Preferís no cargar todo manualmente? Podés solicitar que nuestro equipo cargue tus productos.',
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
  titulo: 'Tené el control de tu comercio en un solo lugar',
  descripcion:
    'Organizá tus productos, seguí los movimientos de stock y consultá las ventas de tu negocio sin depender de registros dispersos.',
  items: [
    'Encontrá tus productos y consultá su disponibilidad fácilmente.',
    'Mantené un registro de entradas, salidas y ajustes de stock.',
    'Consultá las ventas y la recaudación de tu comercio.',
    'Conocé quién realiza cada movimiento y registrá la actividad de tu equipo.',
  ],
  panel: {
    titulo: 'Toda la información de tu comercio organizada',
    descripcion:
      'Consultá tus ventas, revisá los movimientos de stock y mantené un seguimiento de la actividad de tu equipo.',
    nota: 'Cada comercio cuenta con su propio espacio de trabajo.',
  },
} as const;

export const comoEmpezar = {
  id: 'como-empezar',
  etiqueta: 'Cómo empezar',
  titulo: 'Tres pasos para probar StockNext',
  descripcion: 'Sin instalaciones ni configuraciones complicadas.',
  pasos: [
  {
    titulo: 'Solicitá tu demo',
    descripcion:
      'Escribinos por WhatsApp, contanos sobre tu comercio y coordinamos el acceso de prueba.',
  },
  {
    titulo: 'Prepará tus productos',
    descripcion:
      'Podés cargar tus productos manualmente o solicitar nuestro servicio opcional de carga asistida.',
  },
  {
    titulo: 'Empezá a trabajar',
    descripcion:
      'Registrá tus ventas, controlá el stock y sumá a los integrantes de tu equipo.',
  },
],
} as const;

export const paraQuien = {
  id: 'para-quien',
  etiqueta: 'Para quién es',
  titulo: 'Para comercios que necesitan controlar su stock',
descripcion:
  'StockNext está pensado para negocios que venden productos y buscan organizar sus existencias, registrar ventas y llevar un mejor control de su equipo.',
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
  nota:
  'Si tu negocio trabaja con productos, stock y vendedores, StockNext puede ayudarte a llevar un control más organizado.',
} as const;

export const limitaciones = {
  id: 'lo-que-no-hace',
  etiqueta: 'Transparencia',
  titulo: 'Lo que StockNext no hace',
  descripcion:
    'Preferimos que sepas desde el principio qué cubre la plataforma y qué queda fuera.',
  items: [
  'No emite facturas electrónicas.',
  'No procesa cobros mediante posnet: solo registra el medio de pago elegido.',
  'No imprime tickets de venta.',
  'No permite escanear códigos de barras con la cámara del celular.',
  'No se conecta con balanzas.',
  'No administra múltiples sucursales.',
  'Se utiliza desde el navegador, no requiere descargar una aplicación.',
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
    subtitulo: 'Flexibilidad, mes a mes',
    precio: 24999,
    meses: 1,
    sufijoPrecio: '/ mes',
    badge: null,
    descripcion:
      'Todas las herramientas para organizar el stock, registrar ventas y controlar tu comercio.',
    cta: 'Consultar plan mensual',
    mensaje: mensajesWhatsapp.mensual,
    destacado: false,
  },
  {
    id: 'trimestral',
    nombre: 'Plan trimestral',
    subtitulo: 'Ahorrá pagando por adelantado',
    precio: 59999,
    meses: 3,
    sufijoPrecio: '/ 3 meses',
    badge: 'Más conveniente',
    descripcion:
      'Tres meses de acceso completo a StockNext por un precio más conveniente.',
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
    'Conocé los planes disponibles y encontrá la opción que mejor se adapte a tu comercio.',
  banda: 'Solicitá tu demo y probá StockNext durante 14 días gratis, sin tarjeta ni compromisos.',
  ahorroEtiqueta: 'Ahorrás',
  equivalentePrefijo: 'Equivale a',
  equivalenteSufijo: '/ mes',
  ahorroPesosPrefijo: 'Ahorrás',
  ahorroPesosSufijo: 'en total',
  incluyeTitulo: 'Los planes incluyen todas las siguientes funciones:',
  incluye: [
    'Gestión de productos y categorías',
    'Control de stock y movimientos con registro de quién realiza cada operación',
    'Registro de ventas y medios de pago (efectivo, transferencia y tarjeta)',
    'Anulación de ventas con motivo y reposición automática del stock (solo administradores)',
    'Gestión de costos por paquete y cálculo automático del costo por unidad',
    'Compatible con lectores de códigos de barras USB y Bluetooth',
    'Estadísticas de ventas, recaudación y rendimiento por vendedor',
    'Gestión de usuarios y permisos: administrador y vendedor',
    'Notificaciones sobre el estado de la suscripción',
    'Carga inicial de productos asistida por soporte (opcional).',
    'Información de tu negocio privada e independiente de otros comercios',
    'Actualizaciones y mejoras continuas, con nuevas funciones y correcciones de errores',
  ],
  condicionesTitulo: 'Condiciones:',
  condiciones: [
    'Pago mediante transferencia bancaria.',
    'Sin renovación automática ni compromisos de permanencia.',
    'Los períodos contratados son acumulables.',
    '3 días de gracia para regularizar el pago. Luego, el acceso pasa a modo de solo lectura.',
  ],
  nota: 'Consultá por WhatsApp las condiciones vigentes y cómo empezar tu prueba gratuita.',
} as const;

export const funcionesDetalle = [
  {
    icono: 'productos',
    titulo: funcionalidades[0].titulo,
    descripcion: funcionalidades[0].descripcion,
    puntos: [planesSeccion.incluye[0]],
    captura: capturas.productosUnidad,
  },
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
  descripcion:
    'Resolvemos algunas dudas para que conozcas mejor StockNext. Si necesitás más información, escribinos por WhatsApp.',
  items: [
    {
      pregunta: '¿Cómo solicito una demo?',
      respuesta:
        'Escribinos por WhatsApp y coordinamos tu acceso de prueba de 14 días para que puedas conocer y utilizar StockNext.',
    },
    {
      pregunta: '¿Necesito tarjeta para probar?',
      respuesta:
        'No. La prueba es de 14 días gratis y no necesitás ingresar una tarjeta.',
    },
    {
      pregunta: '¿Necesito instalar algo?',
      respuesta:
        'No. StockNext funciona desde el navegador de tu dispositivo, sin necesidad de instalar programas.',
    },
    {
      pregunta: '¿Funciona en el celular?',
      respuesta:
        'Sí. Podés utilizarlo desde el navegador de una computadora, tablet o celular. No necesitás descargar una aplicación.',
    },
    {
      pregunta: '¿Puedo cargar mis propios productos?',
      respuesta:
        'Sí. Podés cargar tus productos manualmente desde el sistema o solicitar el servicio opcional de carga asistida, que realizo personalmente.',
    },
    {
      pregunta: '¿Puedo agregar vendedores?',
      respuesta:
        'Sí. Podés incorporar usuarios con roles de administrador o vendedor y asignarles los permisos correspondientes.',
    },
    {
      pregunta: '¿Puedo anular una venta?',
      respuesta:
        'Sí. Un administrador puede anular una venta indicando el motivo y el stock correspondiente se repone.',
    },
    {
      pregunta: '¿Cómo se paga?',
      respuesta:
        'El pago se realiza mediante transferencia bancaria. No hay renovación automática ni permanencia obligatoria.',
    },
    {
      pregunta: '¿Qué pasa cuando vence la suscripción?',
      respuesta:
        'Al vencer tu suscripción contás con 3 días de gracia para regularizar el pago. Después, el sistema pasa a modo de solo lectura hasta que se reactive el servicio.',
    },
    {
      pregunta: '¿Puedo sumar meses?',
      respuesta:
        'Sí. Los períodos contratados son acumulables, por lo que podés extender tu acceso anticipadamente.',
    },
    {
      pregunta: '¿Cobran con posnet o emiten factura?',
      respuesta:
        'No. StockNext registra el medio de pago elegido (efectivo, transferencia o tarjeta), pero no procesa cobros mediante posnet ni emite facturas electrónicas.',
    },
    {
      pregunta: '¿Dónde se guardan los datos de mi negocio?',
      respuesta:
        'La información se almacena de forma segura en la nube. Esto significa que tus productos, ventas, clientes y movimientos no dependen de tu computadora o celular. Podés acceder a ellos desde cualquier dispositivo con conexión a internet.',
    },
    {
      pregunta: '¿Los datos de cada negocio están separados?',
      respuesta:
        'Sí. Cada negocio tiene su propia información, protegida mediante controles de acceso para que sus usuarios solo puedan consultar y gestionar los datos correspondientes a su comercio.',
    },
    {
      pregunta: '¿StockNext recibe actualizaciones?',
      respuesta:
        'Sí. La plataforma recibe mejoras, nuevas funcionalidades y correcciones de errores a medida que evoluciona.',
    },
  ],
} as const;

export const ctaFinal = {
  titulo: 'Empezá a tener el control de tu comercio',
  descripcion:
    'Conocé StockNext, solicitá tu demo y probá sus herramientas durante 14 días sin costo.',
  boton: 'Solicitar demo gratis',
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
