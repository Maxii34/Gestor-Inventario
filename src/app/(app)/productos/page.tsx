'use client';

import {
  Badge,
  Button,
  Card,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { MOCK_ESTADO_STOCK, MOCK_PRODUCTOS } from '@/mocks';
import type { Producto } from '@/types';

const CATEGORIA_OPCIONES = [
  { value: 'todas', label: 'Todas' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'accesorios', label: 'Accesorios' },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'stock-bajo', label: 'Stock bajo' },
  { value: 'sin-stock', label: 'Sin stock' },
];

function formatoMoneda(valor: number): string {
  return `$${valor.toLocaleString('es-AR')}`;
}

const PRODUCTO_COLUMNAS: TableColumn<Producto>[] = [
  {
    key: 'nombre',
    header: 'Producto',
    render: (row) => (
      <span>
        <span className="block font-medium text-zinc-900">{row.nombre}</span>
        <span className="block text-xs text-zinc-500">{row.codigo}</span>
      </span>
    ),
  },
  { key: 'categoriaNombre', header: 'Categoría' },
  {
    key: 'costo',
    header: 'Precio compra',
    align: 'right',
    render: (row) => formatoMoneda(row.costo),
  },
  {
    key: 'precio',
    header: 'Precio venta',
    align: 'right',
    render: (row) => formatoMoneda(row.precio),
  },
  { key: 'stockActual', header: 'Stock', align: 'center' },
  { key: 'stockMinimo', header: 'Stock mínimo', align: 'center' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => {
      const visual = MOCK_ESTADO_STOCK[row.id];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    render: (row) => (
      <span className="inline-flex gap-1">
        <Button type="button" variant="ghost" size="sm" aria-label={`Ver ${row.nombre}`}>
          Ver
        </Button>
        <Button type="button" variant="ghost" size="sm" aria-label={`Editar ${row.nombre}`}>
          Editar
        </Button>
        <Button type="button" variant="ghost" size="sm" aria-label={`Eliminar ${row.nombre}`}>
          Eliminar
        </Button>
      </span>
    ),
  },
];

export default function ProductosPage() {
  return (
    <>
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo y controla el stock."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Nuevo producto
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <Card title="Filtros" subtitle="Controles visuales sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              id="buscar-producto"
              label="Buscar"
              placeholder="Buscar producto..."
              value=""
              onChange={() => undefined}
            />
            <Select
              label="Categoría"
              defaultValue="todas"
              options={CATEGORIA_OPCIONES}
            />
            <Select
              label="Estado"
              defaultValue="todos"
              options={ESTADO_OPCIONES}
            />
          </div>
        </Card>

        <Card title="Listado de productos" subtitle="8 productos registrados">
          <Table
            columns={PRODUCTO_COLUMNAS}
            data={MOCK_PRODUCTOS}
            getRowKey={(row) => row.id}
            emptyMessage="Sin productos para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 5</p>
            <Pagination page={1} totalPages={5} onPageChange={() => undefined} />
          </div>
        </Card>
      </div>
    </>
  );
}
