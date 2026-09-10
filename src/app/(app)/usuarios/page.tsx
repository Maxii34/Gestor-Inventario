'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LuFilter,
  LuPencil,
  LuPlus,
  LuPower,
  LuPowerOff,
  LuSave,
} from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import {
  actualizarUsuario,
  crearUsuario,
  listarUsuarios,
  type BackendUsuario,
} from '@/services/usuarios.service';
import type { AuthRole } from '@/types/auth';

const ROL_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const NUEVO_USUARIO_ROL_OPCIONES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
];

const ROL_VISUAL: Record<AuthRole, { etiqueta: string; tono: 'info' | 'neutral' }> = {
  ADMIN: { etiqueta: 'Administrador', tono: 'info' },
  VENDEDOR: { etiqueta: 'Vendedor', tono: 'neutral' },
};

interface FilaUsuario extends BackendUsuario {
  onEdit: () => void;
  onToggleActive: () => void;
}

const USUARIO_COLUMNAS: TableColumn<FilaUsuario>[] = [
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
    key: 'activo',
    header: 'Estado',
    render: (row) => (
      <Badge tone={row.activo ? 'success' : 'neutral'}>
        {row.activo ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
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
          aria-label={`Editar ${row.nombre}`}
          onClick={row.onEdit}
        >
          <LuPencil aria-hidden="true" size={14} />
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`${row.activo ? 'Desactivar' : 'Activar'} ${row.nombre}`}
          onClick={row.onToggleActive}
        >
          {row.activo ? (
            <>
              <LuPowerOff aria-hidden="true" size={14} />
              Desactivar
            </>
          ) : (
            <>
              <LuPower aria-hidden="true" size={14} />
              Activar
            </>
          )}
        </Button>
      </span>
    ),
  },
];

export default function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [usuarios, setUsuarios] = useState<BackendUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<AuthRole>('VENDEDOR');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toggleTarget, setToggleTarget] = useState<BackendUsuario | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const cargarListado = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setUsuarios([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los usuarios. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }
      await cargarListado();
    }
    void cargarInicial();
  }, [isAdmin, cargarListado]);

  function comenzarEdicion(usuario: BackendUsuario): void {
    setEditingId(usuario.id);
    setFormError(null);
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setPassword('');
    setRol(usuario.rol);
    document.getElementById('usuario-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('VENDEDOR');
    setFormError(null);
  }

  function nuevoUsuario(): void {
    cancelarEdicion();
    document.getElementById('usuario-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function guardarUsuario(): Promise<void> {
    if (isSubmitting) return;
    if (!nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (!email.trim()) {
      setFormError('El email es obligatorio.');
      return;
    }
    if (editingId === null && password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingId === null) {
        await crearUsuario({ nombre: nombre.trim(), email: email.trim(), password, rol });
      } else {
        await actualizarUsuario(editingId, {
          nombre: nombre.trim(),
          email: email.trim(),
          rol,
        });
      }
      cancelarEdicion();
      await cargarListado();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar el usuario. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarToggle(): Promise<void> {
    if (!toggleTarget || isToggling) return;
    setToggleError(null);
    setIsToggling(true);
    try {
      await actualizarUsuario(toggleTarget.id, { activo: !toggleTarget.activo });
      setToggleTarget(null);
      await cargarListado();
    } catch (err) {
      setToggleError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos actualizar el usuario. Inténtalo nuevamente.',
      );
    } finally {
      setIsToggling(false);
    }
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title="Usuarios"
          description="Administra los usuarios y roles de acceso al sistema."
        />
        <Card title="Acceso restringido">
          <p className="text-sm text-zinc-500">
            Esta sección está disponible únicamente para administradores.
          </p>
        </Card>
      </>
    );
  }

  const filas: FilaUsuario[] = usuarios.map((usuario) => ({
    ...usuario,
    onEdit: () => comenzarEdicion(usuario),
    onToggleActive: () => {
      setToggleError(null);
      setToggleTarget(usuario);
    },
  }));

  const total = usuarios.length;
  const administradores = usuarios.filter((usuario) => usuario.rol === 'ADMIN').length;

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios y roles de acceso al sistema."
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={nuevoUsuario}>
            <LuPlus aria-hidden="true" size={16} />
            Nuevo usuario
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card title="Total usuarios">
            <p className="text-2xl font-bold text-zinc-900">{total}</p>
          </Card>
          <Card title="Administradores">
            <p className="text-2xl font-bold text-zinc-900">{administradores}</p>
          </Card>
          <Card title="Vendedores">
            <p className="text-2xl font-bold text-zinc-900">{total - administradores}</p>
          </Card>
        </div>

        <Card
          title="Filtros"
          subtitle="Controles visuales sin funcionalidad"
          actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
        >
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

        <Card title="Listado de usuarios" subtitle={`${total} usuarios registrados`}>
          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando usuarios…</span>
            </div>
          ) : listError ? (
            <div>
              <p className="text-sm text-zinc-500">{listError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarListado()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={USUARIO_COLUMNAS}
              data={filas}
              getRowKey={(row) => row.id}
              emptyMessage="Sin usuarios para mostrar."
            />
          )}
        </Card>

        <Card
          title={editingId === null ? 'Nuevo usuario' : 'Editar usuario'}
          subtitle="Formulario conectado al backend"
          footer={
            <p className="text-xs text-zinc-500">
              Los administradores tienen acceso completo al sistema. Los vendedores
              pueden gestionar las operaciones permitidas para su rol.
            </p>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nombre" htmlFor="usuario-nombre">
              <Input
                id="usuario-nombre"
                placeholder="Ej: Carlos Rodríguez"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </FormField>
            <FormField label="Email" htmlFor="usuario-email">
              <Input
                id="usuario-email"
                type="email"
                placeholder="Ej: carlos@gestor.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            {editingId === null && (
              <FormField label="Contraseña" htmlFor="usuario-password">
                <Input
                  id="usuario-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormField>
            )}
            <FormField label="Rol" htmlFor="usuario-rol">
              <Select
                id="usuario-rol"
                value={rol}
                onChange={(event) => setRol(event.target.value as AuthRole)}
                options={NUEVO_USUARIO_ROL_OPCIONES}
              />
            </FormField>
          </div>
          {formError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={cancelarEdicion}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void guardarUsuario()} disabled={isSubmitting}>
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting
                ? 'Guardando…'
                : editingId === null
                  ? 'Crear usuario'
                  : 'Guardar cambios'}
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={toggleTarget !== null}
        title={toggleTarget?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          toggleTarget
            ? toggleTarget.activo
              ? `¿Desactivar a "${toggleTarget.nombre}"? Ya no podrá iniciar sesión.`
              : `¿Activar a "${toggleTarget.nombre}"? Volverá a poder iniciar sesión.`
            : undefined
        }
        onClose={() => {
          if (!isToggling) setToggleTarget(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isToggling}
              onClick={() => setToggleTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={toggleTarget?.activo ? 'danger' : 'primary'}
              disabled={isToggling}
              onClick={() => void confirmarToggle()}
            >
              {isToggling ? 'Guardando…' : toggleTarget?.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </>
        }
      >
        {toggleError ? (
          <p role="alert" className="text-sm text-red-600">
            {toggleError}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            El cambio se aplica de inmediato en el sistema.
          </p>
        )}
      </Modal>
    </>
  );
}
