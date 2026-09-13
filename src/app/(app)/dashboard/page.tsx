'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import {
  LuArrowUpDown,
  LuPackage,
  LuPlus,
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
import { ApiError } from '@/lib/api/client';
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
  { etiqueta: 'Nuevo producto', icono: LuPlus, href: '/productos' },
  { etiqueta: 'Nueva venta', icono: LuShoppingCart, href: '/ventas' },
  { etiqueta: 'Nuevo cliente', icono: LuUsers, href: '/clientes' },
  { etiqueta: 'Registrar movimiento', icono: LuArrowUpDown, href: '/movimientos' },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-1 h-3 w-52 animate-pulse rounded bg-zinc-100" />
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3].map((fila) => (
                <div key={fila} className="h-9 animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando datos del dashboard…</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [datos, setDatos] = useState<DatosDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <PageHeader title="Dashboard" description="Resumen general del negocio" />

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

      {datos && (
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                titulo: 'Productos',
                valor: datos.resumen.totalProductos,
                secundaria: `${datos.resumen.productosActivos} activos`,
                icono: LuPackage,
                iconoClase: 'border-zinc-200 bg-zinc-100 text-zinc-700',
              },
              {
                titulo: 'Stock bajo',
                valor: datos.resumen.stockBajo,
                secundaria: 'requieren reposición',
                icono: LuTriangleAlert,
                iconoClase: 'border-amber-200 bg-amber-50 text-amber-700',
              },
              {
                titulo: 'Ventas',
                valor: datos.resumen.totalVentas,
                secundaria: 'operaciones registradas',
                icono: LuShoppingCart,
                iconoClase: 'border-zinc-200 bg-zinc-100 text-zinc-700',
              },
              {
                titulo: 'Clientes',
                valor: datos.resumen.totalClientes,
                secundaria: 'registrados en el sistema',
                icono: LuUsers,
                iconoClase: 'border-zinc-200 bg-zinc-100 text-zinc-700',
              },
            ].map((tarjeta, indice) => {
              const Icono = tarjeta.icono;
              return (
                <motion.div
                  key={tarjeta.titulo}
                  {...animacionEntrada(indice * 0.05)}
                  {...animacionHover()}
                  className="h-full"
                >
                  <Card
                    title={tarjeta.titulo}
                    actions={
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tarjeta.iconoClase}`}
                      >
                        <Icono aria-hidden="true" size={18} />
                      </span>
                    }
                    className="h-full border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
                      {tarjeta.valor}
                    </p>
                    <p className="mt-1.5 border-t border-zinc-100 pt-2 text-xs font-medium text-zinc-600">
                      {tarjeta.secundaria}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
            <motion.div {...animacionEntrada(0.2)} className="min-w-0">
              <Card
                title="Ventas recientes"
                subtitle="Últimas operaciones registradas"
                actions={
                  <Badge tone="neutral" className="border border-zinc-200 tabular-nums">
                    {datos.ventasRecientes.length}
                  </Badge>
                }
                className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <Table
                  columns={VENTAS_COLUMNAS}
                  data={datos.ventasRecientes}
                  getRowKey={(row) => row.id}
                  emptyMessage="Sin ventas recientes."
                />
              </Card>
            </motion.div>

            <motion.div {...animacionEntrada(0.25)} className="min-w-0">
              <Card
                title="Productos con stock bajo"
                subtitle="Requieren reposición"
                actions={
                  <Badge
                    tone={datos.stockBajo.length > 0 ? 'warning' : 'neutral'}
                    className={`border tabular-nums ${
                      datos.stockBajo.length > 0 ? 'border-yellow-200' : 'border-zinc-200'
                    }`}
                  >
                    {datos.stockBajo.length}
                  </Badge>
                }
                className="border-amber-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <Table
                  columns={STOCK_COLUMNAS}
                  data={datos.stockBajo}
                  getRowKey={(row) => row.id}
                  emptyMessage="Sin productos con stock bajo."
                />
              </Card>
            </motion.div>
          </div>

          <motion.div {...animacionEntrada(0.3)} {...animacionPresion()}>
            <Card
              title="Acciones rápidas"
              subtitle="Accesos directos a los módulos"
              className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {ACCIONES_RAPIDAS.map((accion, indice) => {
                  const Icono = accion.icono;
                  return (
                    <motion.div
                      key={accion.etiqueta}
                      {...animacionEntrada(0.3 + indice * 0.05)}
                      {...animacionHover()}
                      {...animacionPresion()}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={() => router.push(accion.href)}
                        className="border-zinc-300 bg-white font-medium text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow"
                      >
                        <Icono aria-hidden="true" size={16} />
                        {accion.etiqueta}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
}
