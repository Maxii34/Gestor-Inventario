'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import {
  LuArrowUpRight,
  LuArrowUpDown,
  LuCalendarDays,
  LuCircleDollarSign,
  LuPackage,
  LuPlus,
  LuRefreshCw,
  LuShoppingCart,
  LuTriangleAlert,
  LuUsers,
} from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  PageHeader,
  Table,
  type TableColumn,
} from '@/components';
import { useRecaudacion } from '@/components/estadisticas';
import { useAuth } from '@/context/AuthContext';
import { useSuscripcion } from '@/context/SuscripcionContext';
import { ApiError } from '@/lib/api/client';
import { MODULO_CLIENTES } from '@/lib/config';
import { getDatosDashboard } from '@/services/dashboard.service';
import type {
  DatosDashboard,
  EstadoStockBajo,
  EstadoVentaReciente,
  ProductoStockBajo,
  VentaReciente,
} from '@/types/dashboard';

const VENTA_TONO: Record<EstadoVentaReciente, 'success' | 'warning' | 'danger'> = {
  Pagada: 'success',
  Pendiente: 'warning',
  Cancelada: 'danger',
  Rechazada: 'danger',
};

const VENTA_BADGE_BORDE: Record<EstadoVentaReciente, string> = {
  Pagada: 'border-green-200',
  Pendiente: 'border-yellow-200',
  Cancelada: 'border-red-200',
  Rechazada: 'border-red-200',
};

const STOCK_TONO: Record<EstadoStockBajo, 'danger' | 'warning'> = {
  Crítico: 'danger',
  Bajo: 'warning',
};

const STOCK_BADGE_BORDE: Record<EstadoStockBajo, string> = {
  Crítico: 'border-red-200',
  Bajo: 'border-yellow-200',
};

const VENTAS_COLUMNAS: TableColumn<VentaReciente>[] = [
  {
    key: 'venta',
    header: 'Venta',
    render: (row) => (
      <span className="font-semibold whitespace-nowrap text-zinc-900">{row.venta}</span>
    ),
  },
  {
    key: 'cliente',
    header: 'Cliente',
    render: (row) => (
      <span className="block max-w-55 truncate font-medium text-zinc-900" title={row.cliente}>
        {row.cliente}
      </span>
    ),
  },
  {
    key: 'fecha',
    header: 'Fecha',
    render: (row) => (
      <span className="whitespace-nowrap text-zinc-600 tabular-nums">{row.fecha}</span>
    ),
  },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (row) => (
      <span className="font-semibold whitespace-nowrap text-zinc-900 tabular-nums">
        {row.total}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => (
      <Badge tone={VENTA_TONO[row.estado]} className={`border ${VENTA_BADGE_BORDE[row.estado]}`}>
        {row.estado}
      </Badge>
    ),
  },
];

const STOCK_COLUMNAS: TableColumn<ProductoStockBajo>[] = [
  {
    key: 'producto',
    header: 'Producto',
    render: (row) => (
      <span className="block max-w-55 truncate font-medium text-zinc-900" title={row.producto}>
        {row.producto}
      </span>
    ),
  },
  {
    key: 'categoria',
    header: 'Categoría',
    render: (row) => <span className="whitespace-nowrap text-zinc-600">{row.categoria}</span>,
  },
  {
    key: 'stockActual',
    header: 'Stock actual',
    align: 'center',
    render: (row) => (
      <span
        className={`font-bold tabular-nums ${
          row.stockActual === 0 ? 'text-red-700' : 'text-amber-700'
        }`}
      >
        {row.stockActual}
      </span>
    ),
  },
  {
    key: 'stockMinimo',
    header: 'Stock mínimo',
    align: 'center',
    render: (row) => (
      <span className="text-zinc-600 tabular-nums">{row.stockMinimo}</span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => (
      <Badge tone={STOCK_TONO[row.estado]} className={`border ${STOCK_BADGE_BORDE[row.estado]}`}>
        {row.estado}
      </Badge>
    ),
  },
];

const ACCIONES_RAPIDAS = [
  {
    etiqueta: 'Nueva venta',
    descripcion: 'Registrar una operación',
    icono: LuShoppingCart,
    href: '/ventas',
    tono: 'bg-emerald-50 text-emerald-700',
  },
  {
    etiqueta: 'Agregar producto',
    descripcion: 'Actualizar el catálogo',
    icono: LuPlus,
    href: '/productos',
    tono: 'bg-sky-50 text-sky-700',
  },
  {
    etiqueta: 'Control de stock',
    descripcion: 'Registrar entradas, salidas y ajustes',
    icono: LuArrowUpDown,
    href: '/movimientos',
    tono: 'bg-violet-50 text-violet-700',
  },
  {
    etiqueta: 'Nuevo cliente',
    descripcion: 'Guardar datos de un cliente',
    icono: LuUsers,
    href: '/clientes',
    tono: 'bg-amber-50 text-amber-700',
  },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-52 animate-pulse rounded-2xl bg-zinc-200 motion-reduce:animate-none" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl border border-zinc-200 bg-white motion-reduce:animate-none"
          >
          </div>
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-zinc-200 bg-white motion-reduce:animate-none" />
      <span className="sr-only">Cargando datos del dashboard…</span>
    </div>
  );
}

function formatCurrency(value: number | string): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDashboardDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatRevenuePeriod(date: string): string {
  if (!date) return 'Período seleccionado';
  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(parsedDate);
}

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  const recaudacion = useRecaudacion();
  const [datos, setDatos] = useState<DatosDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cargar = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const resultado = await getDatosDashboard();
      setDatos(resultado);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los datos del dashboard. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function actualizarDashboard(): Promise<void> {
    setIsRefreshing(true);
    await Promise.all([
      cargar(),
      recaudacion.consultar(recaudacion.desde, recaudacion.hasta),
    ]);
    setIsRefreshing(false);
  }

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargar();
    }
    void cargarInicial();
  }, [cargar]);

  function animacionEntrada(retrasoSegundos: number) {
    if (reduceMotion) return {};
    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay: retrasoSegundos, ease: 'easeOut' as const },
    };
  }

  function animacionHover() {
    if (reduceMotion) return {};
    return { whileHover: { y: -2 } };
  }

  function animacionPresion() {
    if (reduceMotion) return {};
    return { whileTap: { scale: 0.98 } };
  }

  return (
    <>
      <PageHeader
        title={`Hola, ${user?.nombre.trim().split(/\s+/)[0] || 'bienvenido'}`}
        description={formatDashboardDate(new Date())}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void actualizarDashboard()}
              disabled={isRefreshing}
            >
              <LuRefreshCw
                aria-hidden="true"
                size={15}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              Actualizar
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/ventas')}
              disabled={soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
            >
              <LuPlus aria-hidden="true" size={16} />
              Nueva venta
            </Button>
          </>
        }
      />

      {isLoading && !datos && <DashboardSkeleton />}

      {!isLoading && error && !datos && (
        <Card
          title="No pudimos cargar los datos del dashboard"
          className="border-red-200 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
              <LuTriangleAlert aria-hidden="true" size={18} />
            </span>
            <p className="pt-1.5 text-sm text-zinc-600">{error}</p>
          </div>
          <div className="mt-4">
            <Button type="button" onClick={cargar}>
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {datos && error && (
        <p role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No se pudo actualizar el resumen. Se mantienen los últimos datos cargados.
        </p>
      )}

      {datos && (
        <div className="space-y-6">
          <section aria-label="Ingresos del período">
            <motion.div {...animacionEntrada(0)}>
              <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white shadow-sm sm:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl"
                />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <LuCircleDollarSign aria-hidden="true" size={18} />
                      </span>
                      Recaudación del período
                    </div>
                    <div aria-live="polite" className="mt-5">
                      {recaudacion.isLoading ? (
                        <div
                          className="h-11 w-52 animate-pulse rounded-lg bg-white/10"
                          aria-label="Cargando recaudación"
                        />
                      ) : recaudacion.error ? (
                        <p role="alert" className="max-w-lg text-sm text-red-200">
                          No se pudo cargar la recaudación: {recaudacion.error}
                        </p>
                      ) : recaudacion.datos ? (
                        <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                          {formatCurrency(recaudacion.datos.totalRecaudado)}
                        </p>
                      ) : (
                        <p className="text-lg text-zinc-300">Sin datos para mostrar</p>
                      )}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                      <LuCalendarDays aria-hidden="true" size={15} />
                      {recaudacion.datos
                        ? formatRevenuePeriod(recaudacion.datos.desde)
                        : 'Las ventas registradas en el período seleccionado'}
                    </p>
                  </div>
                  <Link
                    href="/ventas"
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Ver ventas
                    <LuArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>

          <section
            aria-label="Indicadores del negocio"
            className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
              MODULO_CLIENTES ? 'xl:grid-cols-3' : 'xl:grid-cols-2'
            }`}
          >
            {[
              {
                titulo: 'Ventas registradas',
                valor: datos.resumen.totalVentas,
                detalle: 'en todo el período',
                icono: LuShoppingCart,
                tono: 'bg-sky-50 text-sky-700',
              },
              {
                titulo: 'Productos',
                valor: datos.resumen.totalProductos,
                detalle: `${datos.resumen.productosActivos} activos`,
                icono: LuPackage,
                tono: 'bg-violet-50 text-violet-700',
              },
              ...(MODULO_CLIENTES
                ? [{
                    titulo: 'Clientes',
                    valor: datos.resumen.totalClientes,
                    detalle: 'en tu cartera',
                    icono: LuUsers,
                    tono: 'bg-amber-50 text-amber-700',
                  }]
                : []),
            ].map((item, index) => {
              const Icon = item.icono;
              return (
                <motion.div
                  key={item.titulo}
                  {...animacionEntrada(0.05 + index * 0.05)}
                  {...animacionHover()}
                >
                  <Card className="h-full border-zinc-200/80 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-600">{item.titulo}</p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                          {new Intl.NumberFormat('es-AR').format(item.valor)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{item.detalle}</p>
                      </div>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tono}`}>
                        <Icon aria-hidden="true" size={20} />
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </section>

          <section aria-label="Ventas recientes">
            <motion.div {...animacionEntrada(0.15)} className="min-w-0">
              <Card
                title="Ventas recientes"
                subtitle="Revisá los últimos movimientos y sus estados."
                actions={
                  <Link
                    href="/ventas"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  >
                    Ver todas
                    <LuArrowUpRight aria-hidden="true" size={14} />
                  </Link>
                }
                className="border-zinc-200/80 shadow-sm"
              >
                <Table
                  columns={VENTAS_COLUMNAS}
                  data={datos.ventasRecientes}
                  getRowKey={(row) => row.id}
                  emptyMessage="Todavía no hay ventas. Cuando registres una, aparecerá aquí."
                />
              </Card>
            </motion.div>
          </section>

          <section
            aria-label="Inventario y accesos rápidos"
            className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]"
          >
            <motion.div {...animacionEntrada(0.2)} className="min-w-0">
              <Card
                title="Atención de inventario"
                subtitle={
                  datos.resumen.stockBajo > 0
                    ? 'Productos que alcanzaron el nivel mínimo o están por debajo.'
                    : 'El inventario está al día, no hay productos bajo el mínimo.'
                }
                actions={
                  <Badge
                    tone={datos.resumen.stockBajo > 0 ? 'warning' : 'success'}
                    className="border border-current/10 tabular-nums"
                  >
                    {datos.resumen.stockBajo} {datos.resumen.stockBajo === 1 ? 'producto' : 'productos'}
                  </Badge>
                }
                className={`h-full shadow-sm ${
                  datos.resumen.stockBajo > 0
                    ? 'border-amber-200/80'
                    : 'border-zinc-200/80'
                }`}
              >
                {datos.stockBajo.length > 0 ? (
                  <>
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
                      <LuTriangleAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                      <p>
                        Hay productos que podrían impedir completar una venta. Revisá las cantidades antes de reponer.
                      </p>
                    </div>
                    <Table
                      columns={STOCK_COLUMNAS}
                      data={datos.stockBajo}
                      getRowKey={(row) => row.id}
                      emptyMessage="No hay productos con stock bajo."
                    />
                    <div className="mt-3 flex justify-end">
                      <Link
                        href="/productos"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                      >
                        Revisar inventario
                        <LuArrowUpRight aria-hidden="true" size={14} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-5 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <LuPackage aria-hidden="true" size={19} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-zinc-800">Todo en orden</p>
                    <p className="mt-1 text-xs text-zinc-500">No hay productos que requieran reposición.</p>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div {...animacionEntrada(0.25)} {...animacionPresion()}>
              <Card
                title="Accesos rápidos"
                subtitle="Tareas frecuentes, a un clic."
                className="h-full border-zinc-200/80 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {ACCIONES_RAPIDAS.filter(
                    (accion) => accion.href !== '/clientes' || MODULO_CLIENTES,
                  ).map((accion) => {
                    const Icon = accion.icono;
                    return (
                      <Link
                        key={accion.etiqueta}
                        href={accion.href}
                        className="group flex min-h-16 items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accion.tono}`}>
                          <Icon aria-hidden="true" size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-zinc-800">{accion.etiqueta}</span>
                          <span className="mt-0.5 block text-xs text-zinc-500">{accion.descripcion}</span>
                        </span>
                        <LuArrowUpRight
                          aria-hidden="true"
                          size={15}
                          className="shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </section>
        </div>
      )}
    </>
  );
}
