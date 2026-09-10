'use client';

import { useCallback, useEffect, useState } from 'react';
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

const STOCK_TONO: Record<EstadoStockBajo, 'danger' | 'warning'> = {
  Crítico: 'danger',
  Bajo: 'warning',
};

const VENTAS_COLUMNAS: TableColumn<VentaReciente>[] = [
  { key: 'venta', header: 'Venta' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'total', header: 'Total', align: 'right' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge tone={VENTA_TONO[row.estado]}>{row.estado}</Badge>,
  },
];

const STOCK_COLUMNAS: TableColumn<ProductoStockBajo>[] = [
  { key: 'producto', header: 'Producto' },
  { key: 'categoria', header: 'Categoría' },
  { key: 'stockActual', header: 'Stock actual', align: 'center' },
  { key: 'stockMinimo', header: 'Stock mínimo', align: 'center' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => <Badge tone={STOCK_TONO[row.estado]}>{row.estado}</Badge>,
  },
];

const ACCIONES_RAPIDAS = [
  { etiqueta: 'Nuevo producto', icono: LuPlus },
  { etiqueta: 'Nueva venta', icono: LuShoppingCart },
  { etiqueta: 'Nuevo cliente', icono: LuUsers },
  { etiqueta: 'Registrar movimiento', icono: LuArrowUpDown },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-hidden="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
      <span className="sr-only">Cargando datos del dashboard…</span>
    </div>
  );
}

export default function DashboardPage() {
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

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen general del negocio" />

      {isLoading && !datos && <DashboardSkeleton />}

      {!isLoading && error && !datos && (
        <Card title="No pudimos cargar los datos del dashboard">
          <p className="text-sm text-zinc-500">{error}</p>
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
            <Card
              title="Productos"
              actions={<LuPackage aria-hidden="true" size={20} className="text-zinc-400" />}
            >
              <p className="text-2xl font-bold text-zinc-900">
                {datos.resumen.totalProductos}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {datos.resumen.productosActivos} activos
              </p>
            </Card>
            <Card
              title="Stock bajo"
              actions={<LuTriangleAlert aria-hidden="true" size={20} className="text-zinc-400" />}
            >
              <p className="text-2xl font-bold text-zinc-900">{datos.resumen.stockBajo}</p>
              <p className="mt-1 text-xs text-zinc-500">requieren reposición</p>
            </Card>
            <Card
              title="Ventas"
              actions={<LuShoppingCart aria-hidden="true" size={20} className="text-zinc-400" />}
            >
              <p className="text-2xl font-bold text-zinc-900">{datos.resumen.totalVentas}</p>
              <p className="mt-1 text-xs text-zinc-500">operaciones registradas</p>
            </Card>
            <Card
              title="Clientes"
              actions={<LuUsers aria-hidden="true" size={20} className="text-zinc-400" />}
            >
              <p className="text-2xl font-bold text-zinc-900">
                {datos.resumen.totalClientes}
              </p>
              <p className="mt-1 text-xs text-zinc-500">registrados en el sistema</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
            <Card title="Ventas recientes" subtitle="Últimas operaciones registradas">
              <Table
                columns={VENTAS_COLUMNAS}
                data={datos.ventasRecientes}
                getRowKey={(row) => row.id}
                emptyMessage="Sin ventas recientes."
              />
            </Card>

            <Card title="Productos con stock bajo" subtitle="Requieren reposición">
              <Table
                columns={STOCK_COLUMNAS}
                data={datos.stockBajo}
                getRowKey={(row) => row.id}
                emptyMessage="Sin productos con stock bajo."
              />
            </Card>
          </div>

          <Card title="Acciones rápidas" subtitle="Accesos visuales sin funcionalidad">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ACCIONES_RAPIDAS.map((accion) => {
                const Icono = accion.icono;
                return (
                  <Button key={accion.etiqueta} type="button" variant="outline" fullWidth>
                    <Icono aria-hidden="true" size={16} />
                    {accion.etiqueta}
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
