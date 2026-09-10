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
import { MOCK_CATEGORIAS, MOCK_CATEGORIAS_RESUMEN } from '@/mocks';
import type { Categoria } from '@/types';

const RESUMEN_ITEMS = [
  { id: 'total', titulo: 'Total de categorías', valor: MOCK_CATEGORIAS_RESUMEN.total },
  { id: 'activas', titulo: 'Categorías activas', valor: MOCK_CATEGORIAS_RESUMEN.activas },
  { id: 'inactivas', titulo: 'Categorías inactivas', valor: MOCK_CATEGORIAS_RESUMEN.inactivas },
];

const ESTADO_OPCIONES = [
  { value: 'activa', label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
];

const CATEGORIA_COLUMNAS: TableColumn<Categoria>[] = [
  { key: 'nombre', header: 'Categoría' },
  { key: 'descripcion', header: 'Descripción' },
  { key: 'cantidadProductos', header: 'Productos', align: 'center' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => (
      <Badge tone={row.estado === 'activa' ? 'success' : 'neutral'}>
        {row.estado === 'activa' ? 'Activa' : 'Inactiva'}
      </Badge>
    ),
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

export default function CategoriasPage() {
  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza y administra las categorías de tus productos."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Nueva categoría
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RESUMEN_ITEMS.map((item) => (
            <Card key={item.id} title={item.titulo}>
              <p className="text-2xl font-bold text-zinc-900">{item.valor}</p>
            </Card>
          ))}
        </div>

        <div className="w-full max-w-md">
          <SearchInput
            id="buscar-categoria"
            label="Buscar"
            placeholder="Buscar categoría..."
            value=""
            onChange={() => undefined}
          />
        </div>

        <Card title="Listado de categorías" subtitle="10 categorías registradas">
          <Table
            columns={CATEGORIA_COLUMNAS}
            data={MOCK_CATEGORIAS}
            getRowKey={(row) => row.id}
            emptyMessage="Sin categorías para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 3</p>
            <Pagination page={1} totalPages={3} onPageChange={() => undefined} />
          </div>
        </Card>

        <Card title="Nueva categoría" subtitle="Formulario visual sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nombre" htmlFor="categoria-nombre">
              <Input id="categoria-nombre" placeholder="Ej: Electrónica" />
            </FormField>
            <FormField label="Estado" htmlFor="categoria-estado">
              <Select
                id="categoria-estado"
                defaultValue="activa"
                options={ESTADO_OPCIONES}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Descripción" htmlFor="categoria-descripcion">
                <Input
                  id="categoria-descripcion"
                  placeholder="Descripción breve de la categoría"
                />
              </FormField>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="button">Guardar categoría</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
