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
import { MOCK_MOVIMIENTOS, MOCK_MOVIMIENTOS_RESUMEN } from '@/mocks';
import type { MovimientoStock, TipoMovimiento } from '@/types';

const RESUMEN_ITEMS = [
  { id: 'totales', titulo: 'Movimientos totales', valor: MOCK_MOVIMIENTOS_RESUMEN.totales },
  { id: 'entradas', titulo: 'Entradas', valor: MOCK_MOVIMIENTOS_RESUMEN.entradas },
  { id: 'salidas', titulo: 'Salidas', valor: MOCK_MOVIMIENTOS_RESUMEN.salidas },
  { id: 'ajustes', titulo: 'Ajustes', valor: MOCK_MOVIMIENTOS_RESUMEN.ajustes },
];

const TIPO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
];

const PERIODO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ultimos-7', label: 'Últimos 7 días' },
  { value: 'ultimos-30', label: 'Últimos 30 días' },
];

const PRODUCTO_OPCIONES = [
  { value: 'prod-1', label: 'Notebook Lenovo IdeaPad' },
  { value: 'prod-2', label: 'Mouse Logitech M185' },
  { value: 'prod-3', label: 'Teclado Redragon' },
  { value: 'prod-4', label: 'Monitor Samsung 24"' },
  { value: 'prod-5', label: 'Auriculares JBL' },
];

const TIPO_MOVIMIENTO_OPCIONES = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
];

const TIPO_VISUAL: Record<TipoMovimiento, { etiqueta: string; tono: 'success' | 'danger' | 'info' }> = {
  entrada: { etiqueta: 'Entrada', tono: 'success' },
  salida: { etiqueta: 'Salida', tono: 'danger' },
  ajuste: { etiqueta: 'Ajuste', tono: 'info' },
};

// Formato de presentación de la cantidad con signo.
// Dato visual: los valores provienen del mock, no se calcula stock.
function formatoCantidad(movimiento: MovimientoStock): string {
  if (movimiento.tipo === 'entrada') return `+${movimiento.cantidad}`;
  if (movimiento.tipo === 'salida') return `-${movimiento.cantidad}`;
  return `${movimiento.cantidad}`;
}

const MOVIMIENTO_COLUMNAS: TableColumn<MovimientoStock>[] = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'productoNombre', header: 'Producto' },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (row) => {
      const visual = TIPO_VISUAL[row.tipo];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'cantidad',
    header: 'Cantidad',
    align: 'right',
    render: (row) => <span className="font-medium">{formatoCantidad(row)}</span>,
  },
  { key: 'stockAnterior', header: 'Stock anterior', align: 'center' },
  { key: 'stockNuevo', header: 'Stock nuevo', align: 'center' },
  { key: 'motivo', header: 'Motivo' },
];

export default function MovimientosPage() {
  return (
    <>
      <PageHeader
        title="Movimientos de stock"
        description="Consulta y registra los movimientos de inventario."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Registrar movimiento
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {RESUMEN_ITEMS.map((item) => (
            <Card key={item.id} title={item.titulo}>
              <p className="text-2xl font-bold text-zinc-900">{item.valor}</p>
            </Card>
          ))}
        </div>

        <Card title="Filtros" subtitle="Controles visuales sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              id="buscar-movimiento"
              label="Buscar"
              placeholder="Buscar producto o motivo..."
              value=""
              onChange={() => undefined}
            />
            <Select
              label="Tipo de movimiento"
              defaultValue="todos"
              options={TIPO_OPCIONES}
            />
            <Select label="Período" defaultValue="todos" options={PERIODO_OPCIONES} />
          </div>
        </Card>

        <Card title="Historial de movimientos" subtitle="7 movimientos registrados">
          <Table
            columns={MOVIMIENTO_COLUMNAS}
            data={MOCK_MOVIMIENTOS}
            getRowKey={(row) => row.id}
            emptyMessage="Sin movimientos para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 8</p>
            <Pagination page={1} totalPages={8} onPageChange={() => undefined} />
          </div>
        </Card>

        <Card title="Registrar movimiento" subtitle="Formulario visual sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Producto" htmlFor="movimiento-producto">
              <Select
                id="movimiento-producto"
                placeholder="Seleccionar producto"
                options={PRODUCTO_OPCIONES}
              />
            </FormField>
            <FormField label="Tipo de movimiento" htmlFor="movimiento-tipo">
              <Select
                id="movimiento-tipo"
                defaultValue="entrada"
                options={TIPO_MOVIMIENTO_OPCIONES}
              />
            </FormField>
            <FormField label="Cantidad" htmlFor="movimiento-cantidad">
              <Input
                id="movimiento-cantidad"
                type="number"
                min={1}
                placeholder="0"
              />
            </FormField>
            <FormField label="Motivo" htmlFor="movimiento-motivo">
              <Input id="movimiento-motivo" placeholder="Ej: Compra a proveedor" />
            </FormField>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="button">Registrar movimiento</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
