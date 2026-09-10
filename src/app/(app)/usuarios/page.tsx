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
import { MOCK_USUARIOS, MOCK_USUARIOS_RESUMEN } from '@/mocks';
import type { RolUsuario, Usuario } from '@/types';

const RESUMEN_ITEMS = [
  { id: 'total', titulo: 'Total usuarios', valor: MOCK_USUARIOS_RESUMEN.total },
  { id: 'admins', titulo: 'Administradores', valor: MOCK_USUARIOS_RESUMEN.administradores },
  { id: 'vendedores', titulo: 'Vendedores', valor: MOCK_USUARIOS_RESUMEN.vendedores },
];

const ROL_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'admin', label: 'Administrador' },
  { value: 'vendedor', label: 'Vendedor' },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const NUEVO_USUARIO_ROL_OPCIONES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'vendedor', label: 'Vendedor' },
];

const ROL_VISUAL: Record<RolUsuario, { etiqueta: string; tono: 'info' | 'neutral' }> = {
  admin: { etiqueta: 'Administrador', tono: 'info' },
  vendedor: { etiqueta: 'Vendedor', tono: 'neutral' },
  almacen: { etiqueta: 'Almacén', tono: 'neutral' },
};

const USUARIO_COLUMNAS: TableColumn<Usuario>[] = [
  { key: 'nombre', header: 'Usuario' },
  { key: 'email', header: 'Email' },
  {
    key: 'rol',
    header: 'Rol',
    render: (row) => {
      const visual = ROL_VISUAL[row.rol];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
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
        <Button type="button" variant="ghost" size="sm" aria-label={`Desactivar ${row.nombre}`}>
          Desactivar
        </Button>
      </span>
    ),
  },
];

export default function UsuariosPage() {
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios y roles de acceso al sistema."
        actions={
          <Button type="button" className="w-full sm:w-auto">
            Nuevo usuario
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              id="buscar-usuario"
              label="Buscar"
              placeholder="Buscar por nombre o email..."
              value=""
              onChange={() => undefined}
            />
            <Select label="Rol" defaultValue="todos" options={ROL_OPCIONES} />
            <Select label="Estado" defaultValue="todos" options={ESTADO_OPCIONES} />
          </div>
        </Card>

        <Card title="Listado de usuarios" subtitle="6 usuarios registrados">
          <Table
            columns={USUARIO_COLUMNAS}
            data={MOCK_USUARIOS}
            getRowKey={(row) => row.id}
            emptyMessage="Sin usuarios para mostrar."
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-zinc-500">Página 1 de 2</p>
            <Pagination page={1} totalPages={2} onPageChange={() => undefined} />
          </div>
        </Card>

        <Card
          title="Nuevo usuario"
          subtitle="Formulario visual sin funcionalidad"
          footer={
            <p className="text-xs text-zinc-500">
              Los administradores tienen acceso completo al sistema. Los vendedores
              pueden gestionar las operaciones permitidas para su rol.
            </p>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nombre" htmlFor="usuario-nombre">
              <Input id="usuario-nombre" placeholder="Ej: Carlos Rodríguez" />
            </FormField>
            <FormField label="Email" htmlFor="usuario-email">
              <Input
                id="usuario-email"
                type="email"
                placeholder="Ej: carlos@gestor.com"
              />
            </FormField>
            <FormField label="Contraseña" htmlFor="usuario-password">
              <Input
                id="usuario-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Rol" htmlFor="usuario-rol">
              <Select
                id="usuario-rol"
                defaultValue="vendedor"
                options={NUEVO_USUARIO_ROL_OPCIONES}
              />
            </FormField>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="button">Crear usuario</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
