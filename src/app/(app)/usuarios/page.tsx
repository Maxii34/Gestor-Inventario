'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuBriefcaseBusiness,
  LuCircleCheck,
  LuCircleX,
  LuFilter,
  LuPencil,
  LuPlus,
  LuPower,
  LuPowerOff,
  LuSave,
  LuUsers,
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
import { Reveal } from '@/components/motion';
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
  {
    key: 'nombre',
    header: 'Empleado',
    render: (row) => (
      <div className="min-w-40">
        <p className="font-semibold text-zinc-900">{row.nombre}</p>
        <p className="mt-0.5 max-w-56 truncate text-xs text-zinc-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'rol',
    header: 'Permisos',
    render: (row) => {
      const visual = ROL_VISUAL[row.rol];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'fechaCreacion',
    header: 'Se unió',
    render: (row) => {
      const fecha = new Date(row.fechaCreacion);
      return (
        <span className="whitespace-nowrap text-xs text-zinc-600 tabular-nums">
          {Number.isNaN(fecha.getTime())
            ? '—'
            : new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(fecha)}
        </span>
      );
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toggleTarget, setToggleTarget] = useState<BackendUsuario | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

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
    setIsFormOpen(true);
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setIsFormOpen(false);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('VENDEDOR');
    setFormError(null);
  }

  function nuevoUsuario(): void {
    cancelarEdicion();
    setIsFormOpen(true);
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

  const total = usuarios.length;
  const vendedores = usuarios.filter((usuario) => usuario.rol === 'VENDEDOR').length;
  const activos = usuarios.filter((usuario) => usuario.activo).length;
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    return usuarios.filter((usuario) => {
      if (
        texto &&
        !`${usuario.nombre} ${usuario.email}`.toLocaleLowerCase('es-AR').includes(texto)
      ) {
        return false;
      }
      if (filtroRol !== 'todos' && usuario.rol !== filtroRol) return false;
      if (filtroEstado === 'activos' && !usuario.activo) return false;
      if (filtroEstado === 'inactivos' && usuario.activo) return false;
      return true;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);
  const filas: FilaUsuario[] = usuariosFiltrados.map((usuario) => ({
    ...usuario,
    onEdit: () => comenzarEdicion(usuario),
    onToggleActive: () => {
      setToggleError(null);
      setToggleTarget(usuario);
    },
  }));
  const hayFiltros =
    busqueda.trim() !== '' || filtroRol !== 'todos' || filtroEstado !== 'todos';

  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title="Equipo"
          description="Administra los accesos del personal del comercio."
        />
        <Card title="Acceso restringido">
          <p className="text-sm text-zinc-500">
            La gestión del equipo está disponible únicamente para administradores.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Equipo"
        description="Gestioná quién puede acceder al comercio y qué permisos tiene cada persona."
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={nuevoUsuario}>
            <LuPlus aria-hidden="true" size={16} />
            Agregar empleado
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section aria-label="Resumen del equipo" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal delay={0}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <LuUsers aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Personas en el equipo</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : total.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <LuCircleCheck aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Con acceso activo</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : activos.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <LuBriefcaseBusiness aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Empleados</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : vendedores.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <LuCircleX aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Sin acceso</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : (total - activos).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>

        <Reveal delay={0.15}>
          <Card
            title="Buscar y filtrar el equipo"
            subtitle="Encontrá personas por nombre o correo y acotá por permisos o acceso."
            actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
            className="border-zinc-200/80 shadow-sm"
          >
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <SearchInput
                id="buscar-usuario"
                label="Nombre o correo"
                placeholder="Ej. María Gómez, maria@comercio.com"
                value={busqueda}
                onChange={setBusqueda}
              />
              <Select
                label="Permisos"
                value={filtroRol}
                onChange={(event) => setFiltroRol(event.target.value)}
                options={ROL_OPCIONES}
              />
              <Select
                label="Acceso"
                value={filtroEstado}
                onChange={(event) => setFiltroEstado(event.target.value)}
                options={ESTADO_OPCIONES}
              />
            </div>
            {hayFiltros && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                <p className="text-xs text-zinc-500">
                  {usuariosFiltrados.length.toLocaleString('es-AR')}{' '}
                  {usuariosFiltrados.length === 1 ? 'persona encontrada' : 'personas encontradas'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroRol('todos');
                    setFiltroEstado('todos');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card
            title="Personas del equipo"
            subtitle={
              hayFiltros
                ? `${usuariosFiltrados.length.toLocaleString('es-AR')} resultados de ${total}`
                : `${total.toLocaleString('es-AR')} personas registradas`
            }
            className="border-zinc-200/80 shadow-sm"
          >
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
              emptyMessage={
                hayFiltros
                  ? 'No encontramos personas con esos filtros.'
                  : 'Todavía no hay personas en el equipo.'
              }
            />
          )}
          </Card>
        </Reveal>
      </div>

      <Modal
        open={isFormOpen}
        title={editingId === null ? 'Agregar empleado' : 'Editar persona'}
        description={
          editingId === null
            ? 'Creá un acceso individual para una persona de tu equipo.'
            : 'Actualizá los datos y permisos de acceso de esta persona.'
        }
        size="md"
        onClose={() => {
          if (!isSubmitting) cancelarEdicion();
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={cancelarEdicion}
            >
              Cancelar
            </Button>
            <Button type="submit" form="usuario-formulario" disabled={isSubmitting}>
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting
                ? 'Guardando…'
                : editingId === null
                  ? 'Crear acceso'
                  : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <form
          id="usuario-formulario"
          onSubmit={(event) => {
            event.preventDefault();
            void guardarUsuario();
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Nombre completo" htmlFor="usuario-nombre" required>
            <Input
              id="usuario-nombre"
              placeholder="Ej: Carlos Rodríguez"
              autoComplete="name"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </FormField>
          <FormField label="Correo electrónico" htmlFor="usuario-email" required>
            <Input
              id="usuario-email"
              type="email"
              placeholder="Ej: carlos@comercio.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          {editingId === null && (
            <FormField
              label="Contraseña inicial"
              htmlFor="usuario-password"
              required
              hint="Debe tener al menos 6 caracteres."
            >
              <Input
                id="usuario-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
          )}
          <FormField label="Permisos del sistema" htmlFor="usuario-rol" required>
            <Select
              id="usuario-rol"
              value={rol}
              onChange={(event) => setRol(event.target.value as AuthRole)}
              options={NUEVO_USUARIO_ROL_OPCIONES}
            />
          </FormField>
          <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-900">
            <p>
              <strong>Vendedor:</strong> acceso a las operaciones cotidianas del comercio.
            </p>
            <p className="mt-1">
              <strong>Administrador:</strong> acceso completo, incluida la gestión del equipo.
            </p>
          </div>
          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
        </form>
      </Modal>

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
