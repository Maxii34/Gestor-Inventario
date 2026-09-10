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
import { MOCK_CLIENTES, MOCK_CLIENTES_RESUMEN } from '@/mocks';
import type { Cliente } from '@/types';

const RESUMEN_ITEMS = [
  { id: 'total', titulo: 'Total clientes', valor: MOCK_CLIENTES_RESUMEN.total },
  { id: 'activos', titulo: 'Clientes activos', valor: MOCK_CLIENTES_RESUMEN.activos },
  { id: 'inactivos', titulo: 'Clientes inactivos', valor: MOCK_CLIENTES_RESUMEN.inactivos },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const CLIENTE_COLUMNAS: TableColumn<Cliente>[] = [
  { key: 'nombre', header: 'Cliente' },
  { key: 'documento', header: 'DNI' },
  { key: 'telefono', header: 'Teléfono' },
  { key: 'email', header: 'Email' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => (
      <Badge tone={row.estado === 'activo' ? 'success' : 'neutral'}>
        {row.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    render: (row) => (
      <span className="inline-flex gap-1">
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

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Administra la información de los clientes registrados."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Nuevo cliente
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

        <Card title="Filtros" subtitle="Controles visuales sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SearchInput
              id="buscar-cliente"
              label="Buscar"
              placeholder="Buscar por nombre, apellido, DNI o email..."
              value=""
              onChange={() => undefined}
            />
            <Select label="Estado" defaultValue="todos" options={ESTADO_OPCIONES} />
          </div>
        </Card>

        <Card title="Listado de clientes" subtitle="8 clientes registrados">
          <Table
            columns={CLIENTE_COLUMNAS}
            data={MOCK_CLIENTES}
            getRowKey={(row) => row.id}
            emptyMessage="Sin clientes para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 6</p>
            <Pagination page={1} totalPages={6} onPageChange={() => undefined} />
          </div>
        </Card>

        <Card title="Nuevo cliente" subtitle="Formulario visual sin funcionalidad">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nombre" htmlFor="cliente-nombre">
              <Input id="cliente-nombre" placeholder="Ej: Juan" />
            </FormField>
            <FormField label="Apellido" htmlFor="cliente-apellido">
              <Input id="cliente-apellido" placeholder="Ej: Pérez" />
            </FormField>
            <FormField label="DNI" htmlFor="cliente-dni">
              <Input id="cliente-dni" placeholder="Ej: 38.456.789" />
            </FormField>
            <FormField label="Teléfono" htmlFor="cliente-telefono">
              <Input id="cliente-telefono" placeholder="Ej: 381-555-1234" />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Email" htmlFor="cliente-email">
                <Input
                  id="cliente-email"
                  type="email"
                  placeholder="Ej: juan.perez@email.com"
                />
              </FormField>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="button">Guardar cliente</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
