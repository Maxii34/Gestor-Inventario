'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LuArrowLeft, LuCopy, LuKeyRound, LuPencil, LuRefreshCw, LuSearch } from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { ApiError } from '@/lib/api/client';
import { confirmAction, notifySuccess } from '@/lib/notifications/toast';
import {
  editarUsuarioComercio,
  listarUsuariosComercio,
  resetearPasswordUsuario,
  type PlataformaUsuario,
} from '@/services/plataforma.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

interface UsuarioFila extends PlataformaUsuario {
  onEdit: () => void;
  onToggle: () => void;
  onReset: () => void;
}

export default function UsuariosComercioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const comercioId = Number(params.id);
  const [usuarios, setUsuarios] = useState<PlataformaUsuario[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlataformaUsuario | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rol: 'VENDEDOR' as PlataformaUsuario['rol'],
    activo: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<number | null>(null);

  const cargarUsuarios = useCallback(async () => {
    if (!Number.isInteger(comercioId) || comercioId <= 0) {
      setError('El identificador del comercio no es válido.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const resultado = await listarUsuariosComercio(
        comercioId,
        page,
        PAGE_SIZE,
        busquedaAplicada || undefined,
      );
      setUsuarios(resultado.usuarios);
      setMeta(resultado.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, [busquedaAplicada, comercioId, page]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void cargarUsuarios();
    });
    return () => {
      cancelled = true;
    };
  }, [cargarUsuarios]);

  function buscar(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setPage(1);
    setBusquedaAplicada(busqueda.trim());
  }

  function editar(usuario: PlataformaUsuario): void {
    setEditing(usuario);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setFormError(null);
  }

  async function guardarUsuario(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!editing || isSaving) return;
    setIsSaving(true);
    setFormError(null);
    try {
      await editarUsuarioComercio(comercioId, editing.id, {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
        activo: form.activo,
      });
      notifySuccess('Usuario actualizado', `Se guardaron los cambios de ${form.nombre.trim()}.`);
      setEditing(null);
      await cargarUsuarios();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario.');
    } finally {
      setIsSaving(false);
    }
  }

  async function alternarEstado(usuario: PlataformaUsuario): Promise<void> {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    const confirmado = await confirmAction(
      `${usuario.activo ? 'Desactivar' : 'Activar'} usuario`,
      `¿Querés ${accion} el acceso de ${usuario.nombre}?`,
      usuario.activo ? 'Desactivar' : 'Activar',
    );
    if (!confirmado) return;
    try {
      await editarUsuarioComercio(comercioId, usuario.id, { activo: !usuario.activo });
      notifySuccess(usuario.activo ? 'Usuario desactivado' : 'Usuario activado');
      await cargarUsuarios();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado del usuario.');
    }
  }

  async function resetearPassword(usuario: PlataformaUsuario): Promise<void> {
    const confirmado = await confirmAction(
      'Restablecer contraseña',
      `Se generará una contraseña temporal para ${usuario.nombre} y deberá cambiarla al ingresar.`,
      'Restablecer',
    );
    if (!confirmado) return;
    setIsResetting(usuario.id);
    setCopyError(null);
    try {
      setPasswordTemporal(await resetearPasswordUsuario(comercioId, usuario.id));
      notifySuccess('Contraseña restablecida', 'Copiá y compartí la contraseña temporal de forma segura.');
      await cargarUsuarios();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setIsResetting(null);
    }
  }

  async function copiarPassword(): Promise<void> {
    if (!passwordTemporal) return;
    try {
      await navigator.clipboard.writeText(passwordTemporal);
      setCopyError(null);
      notifySuccess('Contraseña copiada');
    } catch {
      setCopyError('No se pudo copiar. Seleccioná la contraseña y copiala manualmente.');
    }
  }

  const filas: UsuarioFila[] = usuarios.map((usuario) => ({
    ...usuario,
    onEdit: () => editar(usuario),
    onToggle: () => void alternarEstado(usuario),
    onReset: () => void resetearPassword(usuario),
  }));
  const columnas: TableColumn<UsuarioFila>[] = [
    {
      key: 'nombre',
      header: 'Usuario',
      render: (usuario) => (
        <div>
          <p className="font-medium text-zinc-900">{usuario.nombre}</p>
          <p className="text-xs text-zinc-500">{usuario.email}</p>
        </div>
      ),
    },
    { key: 'rol', header: 'Rol', render: (usuario) => usuario.rol === 'ADMIN' ? 'Administrador' : 'Vendedor' },
    {
      key: 'activo',
      header: 'Estado',
      render: (usuario) => <Badge tone={usuario.activo ? 'success' : 'neutral'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'debeCambiarPassword',
      header: 'Acceso',
      render: (usuario) => usuario.debeCambiarPassword ? 'Debe cambiar contraseña' : 'Normal',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (usuario) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button type="button" size="sm" variant="action" onClick={usuario.onEdit}>
            <LuPencil aria-hidden="true" size={14} /> Editar
          </Button>
          <Button type="button" size="sm" variant="action" onClick={usuario.onToggle}>
            {usuario.activo ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="action"
            disabled={isResetting === usuario.id}
            onClick={usuario.onReset}
          >
            <LuKeyRound aria-hidden="true" size={14} />
            {isResetting === usuario.id ? 'Restableciendo…' : 'Resetear clave'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios del comercio"
        description="Administrá accesos, roles y contraseñas de este comercio."
        actions={
          <Button type="button" variant="outline" onClick={() => router.push('/plataforma/comercios')}>
            <LuArrowLeft aria-hidden="true" size={15} /> Volver a comercios
          </Button>
        }
      />
      <Card title="Usuarios" subtitle={`${meta.total} usuarios registrados`}>
        <form onSubmit={buscar} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar usuario por nombre o email</span>
            <LuSearch aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre o email"
              maxLength={100}
              className="w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-900"
            />
          </label>
          <Button type="submit"><LuSearch aria-hidden="true" size={15} /> Buscar</Button>
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => void cargarUsuarios()}>
            <LuRefreshCw aria-hidden="true" size={15} /> Actualizar
          </Button>
        </form>
        {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {isLoading ? (
          <p className="py-12 text-center text-sm text-zinc-500">Cargando usuarios…</p>
        ) : (
          <>
            <Table columns={columnas} data={filas} getRowKey={(usuario) => usuario.id} emptyMessage="No encontramos usuarios." />
            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-zinc-500">Página {meta.page} de {meta.totalPaginas || 1}</p>
              <Pagination page={page} totalPages={meta.totalPaginas || 1} disabled={isLoading} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title="Editar usuario"
        onClose={() => {
          if (!isSaving) setEditing(null);
        }}
        footer={
          <>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" form="plataforma-usuario-form" disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar cambios'}</Button>
          </>
        }
      >
        <form id="plataforma-usuario-form" onSubmit={(event) => void guardarUsuario(event)} className="space-y-4">
          <FormField label="Nombre" htmlFor="plataforma-usuario-nombre">
            <Input id="plataforma-usuario-nombre" required maxLength={120} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
          </FormField>
          <FormField label="Email" htmlFor="plataforma-usuario-email">
            <Input id="plataforma-usuario-email" type="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </FormField>
          <Select
            label="Rol"
            value={form.rol}
            onChange={(event) => setForm({ ...form, rol: event.target.value as PlataformaUsuario['rol'] })}
            options={[{ value: 'ADMIN', label: 'Administrador' }, { value: 'VENDEDOR', label: 'Vendedor' }]}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={form.activo} onChange={(event) => setForm({ ...form, activo: event.target.checked })} />
            Usuario activo
          </label>
          {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={passwordTemporal !== null}
        title="Contraseña temporal generada"
        description="Se muestra una sola vez. Compartila de forma segura; el usuario deberá cambiarla al ingresar."
        onClose={() => {
          setPasswordTemporal(null);
          setCopyError(null);
        }}
        footer={<Button type="button" onClick={() => setPasswordTemporal(null)}>Listo</Button>}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 select-all break-all rounded-lg bg-zinc-100 p-3 text-base font-semibold tracking-widest">{passwordTemporal}</code>
            <Button type="button" variant="outline" aria-label="Copiar contraseña temporal" onClick={() => void copiarPassword()}>
              <LuCopy aria-hidden="true" size={16} /> Copiar
            </Button>
          </div>
          {copyError && <p role="alert" className="text-sm text-red-700">{copyError}</p>}
        </div>
      </Modal>
    </div>
  );
}
