'use client';

import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import {
  MOCK_DETALLE_NUEVA_VENTA,
  MOCK_RESUMEN_NUEVA_VENTA,
  MOCK_VENTAS,
  MOCK_VENTAS_RESUMEN,
} from '@/mocks';
import type { DetalleVenta, EstadoVenta, Venta } from '@/types';

function formatoMoneda(valor: number): string {
  return `$${valor.toLocaleString('es-AR')}`;
}

const RESUMEN_ITEMS = [
  { id: 'periodo', titulo: 'Ventas del período', valor: String(MOCK_VENTAS_RESUMEN.periodo) },
  { id: 'cobradas', titulo: 'Ventas cobradas', valor: String(MOCK_VENTAS_RESUMEN.cobradas) },
  { id: 'pendientes', titulo: 'Pendientes', valor: String(MOCK_VENTAS_RESUMEN.pendientes) },
  { id: 'canceladas', titulo: 'Canceladas', valor: String(MOCK_VENTAS_RESUMEN.canceladas) },
  { id: 'total', titulo: 'Total vendido', valor: MOCK_VENTAS_RESUMEN.totalVendido },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const MEDIO_PAGO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mercado-pago', label: 'Mercado Pago' },
];

const PERIODO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ultimos-7', label: 'Últimos 7 días' },
  { value: 'ultimos-30', label: 'Últimos 30 días' },
];

const CLIENTE_OPCIONES = [
  { value: 'consumidor-final', label: 'Consumidor final' },
  { value: 'juan-perez', label: 'Juan Pérez' },
  { value: 'maria-gonzalez', label: 'María González' },
  { value: 'carlos-rodriguez', label: 'Carlos Rodríguez' },
  { value: 'ana-martinez', label: 'Ana Martínez' },
];

const PRODUCTO_OPCIONES = [
  { value: 'teclado', label: 'Teclado mecánico' },
  { value: 'mouse', label: 'Mouse inalámbrico' },
  { value: 'monitor', label: 'Monitor Samsung 24"' },
  { value: 'auriculares', label: 'Auriculares JBL' },
];

const NUEVA_VENTA_MEDIO_PAGO_OPCIONES = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mercado-pago', label: 'Mercado Pago' },
];

const ESTADO_VISUAL: Record<EstadoVenta, { etiqueta: string; tono: 'success' | 'warning' | 'danger' }> = {
  completada: { etiqueta: 'Pagada', tono: 'success' },
  pendiente: { etiqueta: 'Pendiente', tono: 'warning' },
  cancelada: { etiqueta: 'Cancelada', tono: 'danger' },
};

const VENTA_COLUMNAS: TableColumn<Venta>[] = [
  { key: 'codigoComprobante', header: 'Venta' },
  { key: 'clienteNombre', header: 'Cliente' },
  { key: 'fecha', header: 'Fecha' },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (row) => formatoMoneda(row.total),
  },
  { key: 'metodoPago', header: 'Medio de pago' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => {
      const visual = ESTADO_VISUAL[row.estado];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    render: (row) => (
      <span className="inline-flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Ver detalle ${row.codigoComprobante}`}
        >
          Ver detalle
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Cancelar ${row.codigoComprobante}`}
        >
          Cancelar
        </Button>
      </span>
    ),
  },
];

const DETALLE_COLUMNAS: TableColumn<DetalleVenta>[] = [
  { key: 'productoNombre', header: 'Producto' },
  {
    key: 'precioUnitario',
    header: 'Precio',
    align: 'right',
    render: (row) => formatoMoneda(row.precioUnitario),
  },
  { key: 'cantidad', header: 'Cantidad', align: 'center' },
  {
    key: 'subtotal',
    header: 'Subtotal',
    align: 'right',
    render: (row) => formatoMoneda(row.subtotal),
  },
  {
    key: 'accion',
    header: 'Acción',
    align: 'right',
    render: (row) => (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Quitar ${row.productoNombre}`}
      >
        Quitar
      </Button>
    ),
  },
];

export default function VentasPage() {
  return (
    <>
      <PageHeader
        title="Ventas"
        description="Consulta las ventas registradas y genera nuevas operaciones."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Nueva venta
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {RESUMEN_ITEMS.map((item) => (
            <Card key={item.id} title={item.titulo}>
              <p className="text-2xl font-bold text-zinc-900">{item.valor}</p>
            </Card>
          ))}
        </div>

        <Card title="Filtros" subtitle="Controles visuales sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              id="buscar-venta"
              label="Buscar"
              placeholder="Buscar por cliente o número de venta..."
              value=""
              onChange={() => undefined}
            />
            <Select label="Estado" defaultValue="todos" options={ESTADO_OPCIONES} />
            <Select
              label="Medio de pago"
              defaultValue="todos"
              options={MEDIO_PAGO_OPCIONES}
            />
            <Select label="Período" defaultValue="todos" options={PERIODO_OPCIONES} />
          </div>
        </Card>

        <Card title="Listado de ventas" subtitle="8 ventas registradas">
          <Table
            columns={VENTA_COLUMNAS}
            data={MOCK_VENTAS}
            getRowKey={(row) => row.id}
            emptyMessage="Sin ventas para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 10</p>
            <Pagination page={1} totalPages={10} onPageChange={() => undefined} />
          </div>
        </Card>

        <Card title="Nueva venta" subtitle="Operación interna visual sin funcionalidad">
          <div className="flex flex-col gap-6">
            <FormField label="Cliente" htmlFor="nueva-venta-cliente">
              <Select
                id="nueva-venta-cliente"
                placeholder="Seleccionar cliente"
                options={CLIENTE_OPCIONES}
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Productos de la venta</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_140px_auto] md:items-end">
                <FormField label="Producto" htmlFor="nueva-venta-producto">
                  <Select
                    id="nueva-venta-producto"
                    placeholder="Seleccionar producto"
                    options={PRODUCTO_OPCIONES}
                  />
                </FormField>
                <FormField label="Cantidad" htmlFor="nueva-venta-cantidad">
                  <Input id="nueva-venta-cantidad" type="number" min={1} placeholder="1" />
                </FormField>
                <Button type="button" variant="outline">
                  Agregar
                </Button>
              </div>
            </div>

            <Table
              columns={DETALLE_COLUMNAS}
              data={MOCK_DETALLE_NUEVA_VENTA}
              getRowKey={(row) => row.productoId}
              emptyMessage="Sin productos en la venta."
            />

            <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{MOCK_RESUMEN_NUEVA_VENTA.subtotal}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Descuento</span>
                <span>{MOCK_RESUMEN_NUEVA_VENTA.descuento}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                <span>Total</span>
                <span>{MOCK_RESUMEN_NUEVA_VENTA.total}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Medio de pago" htmlFor="nueva-venta-pago">
                <Select
                  id="nueva-venta-pago"
                  defaultValue="efectivo"
                  options={NUEVA_VENTA_MEDIO_PAGO_OPCIONES}
                />
              </FormField>
              <p className="self-end text-xs text-zinc-500">
                El procesamiento del pago se realizará al conectar el sistema con el
                backend.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="button">Registrar venta</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
