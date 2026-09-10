'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuFilter, LuPencil, LuPlus, LuSave, LuTrash2 } from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  FormField,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { ApiError } from '@/lib/api/client';
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes,
  type BackendCliente,
} from '@/services/clientes.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

interface FormularioCliente {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
}

const FORMULARIO_VACIO: FormularioCliente = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
};

function validarFormulario(form: FormularioCliente): string | null {
  if (!form.nombre.trim()) return 'El nombre es obligatorio.';
  if (!form.apellido.trim()) return 'El apellido es obligatorio.';
  return null;
}

function textoOpcional(valor?: string | null): string {
  const texto = valor?.trim() ?? '';
  return texto.length > 0 ? texto : '—';
}

interface FilaCliente extends BackendCliente {
  onEdit: () => void;
  onDelete: () => void;
}

const CLIENTE_COLUMNAS: TableColumn<FilaCliente>[] = [
  {
    key: 'nombre',
    header: 'Cliente',
    render: (row) => `${row.nombre} ${row.apellido}`.trim(),
  },
  { key: 'dni', header: 'DNI', render: (row) => textoOpcional(row.dni) },
  { key: 'telefono', header: 'Teléfono', render: (row) => textoOpcional(row.telefono) },
  { key: 'email', header: 'Email', render: (row) => textoOpcional(row.email) },
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
          aria-label={`Editar ${row.nombre} ${row.apellido}`}
          onClick={row.onEdit}
        >
          <LuPencil aria-hidden="true" size={14} />
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Eliminar ${row.nombre} ${row.apellido}`}
          onClick={row.onDelete}
        >
          <LuTrash2 aria-hidden="true" size={14} />
          Eliminar
        </Button>
      </span>
    ),
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<BackendCliente[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [form, setForm] = useState<FormularioCliente>(FORMULARIO_VACIO);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendCliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [todosClientes, setTodosClientes] = useState<BackendCliente[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const hayFiltros = busqueda.trim() !== '' || filtroEstado !== 'todos';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarClientes(pagina, PAGE_SIZE);
      setClientes(resultado.clientes);
      setMeta(resultado.meta);
    } catch (err) {
      setClientes([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los clientes. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarTodoParaFiltrar = useCallback(async (): Promise<void> => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      const primera = await listarClientes(1, 1);
      if (primera.meta.total === 0) {
        setTodosClientes([]);
        return;
      }
      const completa = await listarClientes(1, primera.meta.total);
      setTodosClientes(completa.clientes);
    } catch (err) {
      setTodosClientes([]);
      setFilterError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos aplicar los filtros. Inténtalo nuevamente.',
      );
    } finally {
      setIsFiltering(false);
    }
  }, []);

  useEffect(() => {
    if (hayFiltros) return;
    async function cargarInicial(): Promise<void> {
      await cargarPagina(page);
    }
    void cargarInicial();
  }, [page, hayFiltros, cargarPagina]);

  useEffect(() => {
    if (!hayFiltros) return;
    async function cargarTodo(): Promise<void> {
      await cargarTodoParaFiltrar();
    }
    void cargarTodo();
  }, [hayFiltros, cargarTodoParaFiltrar]);

  function setCampo(campo: keyof FormularioCliente, valor: string): void {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function comenzarEdicion(cliente: BackendCliente): void {
    setEditingId(cliente.id);
    setFormError(null);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni ?? '',
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
    });
    document.getElementById('cliente-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setForm(FORMULARIO_VACIO);
    setFormError(null);
  }

  function nuevoCliente(): void {
    cancelarEdicion();
    document.getElementById('cliente-formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function guardarCliente(): Promise<void> {
    if (isSubmitting) return;
    const validacion = validarFormulario(form);
    if (validacion) {
      setFormError(validacion);
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const input = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        ...(form.dni.trim() ? { dni: form.dni.trim() } : {}),
        ...(form.telefono.trim() ? { telefono: form.telefono.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      };
      if (editingId === null) {
        await crearCliente(input);
      } else {
        await actualizarCliente(editingId, input);
      }
      cancelarEdicion();
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else {
        await cargarPagina(page);
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar el cliente. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarEliminacion(): Promise<void> {
    if (!deleteTarget || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await eliminarCliente(deleteTarget.id);
      setDeleteTarget(null);
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else if (clientes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await cargarPagina(page);
      }
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos eliminar el cliente. Inténtalo nuevamente.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return todosClientes.filter((cliente) => {
      if (
        texto &&
        !`${cliente.nombre} ${cliente.apellido} ${cliente.dni ?? ''} ${cliente.email ?? ''}`
          .toLowerCase()
          .includes(texto)
      )
        return false;
      if (filtroEstado === 'activos' && !cliente.activo) return false;
      if (filtroEstado === 'inactivos' && cliente.activo) return false;
      return true;
    });
  }, [todosClientes, busqueda, filtroEstado]);

  const totalPaginasVisibles = hayFiltros
    ? Math.max(1, Math.ceil(clientesFiltrados.length / PAGE_SIZE))
    : meta.totalPaginas;
  const paginaVisible = hayFiltros ? Math.min(page, totalPaginasVisibles) : meta.page;
  const filasBase = hayFiltros
    ? clientesFiltrados.slice((paginaVisible - 1) * PAGE_SIZE, paginaVisible * PAGE_SIZE)
    : clientes;

  const filas = filasBase.map((cliente) => ({
    ...cliente,
    onEdit: () => comenzarEdicion(cliente),
    onDelete: () => {
      setDeleteError(null);
      setDeleteTarget(cliente);
    },
  }));

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Administra la información de los clientes registrados."
        actions={
          <Button type="button" className="w-full sm:w-auto" onClick={nuevoCliente}>
            <LuPlus aria-hidden="true" size={16} />
            Nuevo cliente
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card title="Total clientes">
            <p className="text-2xl font-bold text-zinc-900">{meta.total}</p>
            <p className="mt-1 text-xs text-zinc-500">registrados en el sistema</p>
          </Card>
        </div>

        <Card
          title="Filtros"
          subtitle="Filtros aplicados sobre los datos cargados"
          actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SearchInput
              id="buscar-cliente"
              label="Buscar"
              placeholder="Buscar por nombre, apellido, DNI o email..."
              value={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPage(1);
              }}
            />
            <Select
              label="Estado"
              value={filtroEstado}
              onChange={(event) => {
                setFiltroEstado(event.target.value);
                setPage(1);
              }}
              options={ESTADO_OPCIONES}
            />
          </div>
        </Card>

        <Card
          title="Listado de clientes"
          subtitle={
            hayFiltros
              ? `${clientesFiltrados.length} clientes encontrados`
              : `${meta.total} clientes registrados`
          }
        >
          {isLoading || isFiltering ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando clientes…</span>
            </div>
          ) : hayFiltros && filterError ? (
            <div>
              <p className="text-sm text-zinc-500">{filterError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarTodoParaFiltrar()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !hayFiltros && listError ? (
            <div>
              <p className="text-sm text-zinc-500">{listError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarPagina(page)}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={CLIENTE_COLUMNAS}
                data={filas}
                getRowKey={(row) => row.id}
                emptyMessage={
                  hayFiltros
                    ? 'Sin resultados para los filtros aplicados.'
                    : 'Sin clientes para mostrar.'
                }
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-zinc-500">
                  Página {paginaVisible} de {totalPaginasVisibles}
                </p>
                <Pagination
                  page={paginaVisible}
                  totalPages={totalPaginasVisibles}
                  onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
                />
              </div>
            </>
          )}
        </Card>

        <Card
          title={editingId === null ? 'Nuevo cliente' : 'Editar cliente'}
          subtitle="Formulario conectado al backend"
        >
          <div id="cliente-formulario" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nombre" htmlFor="cliente-nombre">
              <Input
                id="cliente-nombre"
                placeholder="Ej: Juan"
                value={form.nombre}
                onChange={(event) => setCampo('nombre', event.target.value)}
              />
            </FormField>
            <FormField label="Apellido" htmlFor="cliente-apellido">
              <Input
                id="cliente-apellido"
                placeholder="Ej: Pérez"
                value={form.apellido}
                onChange={(event) => setCampo('apellido', event.target.value)}
              />
            </FormField>
            <FormField label="DNI" htmlFor="cliente-dni">
              <Input
                id="cliente-dni"
                placeholder="Ej: 38.456.789 (opcional)"
                value={form.dni}
                onChange={(event) => setCampo('dni', event.target.value)}
              />
            </FormField>
            <FormField label="Teléfono" htmlFor="cliente-telefono">
              <Input
                id="cliente-telefono"
                placeholder="Ej: 381-555-1234 (opcional)"
                value={form.telefono}
                onChange={(event) => setCampo('telefono', event.target.value)}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Email" htmlFor="cliente-email">
                <Input
                  id="cliente-email"
                  type="email"
                  placeholder="Ej: juan.perez@email.com (opcional)"
                  value={form.email}
                  onChange={(event) => setCampo('email', event.target.value)}
                />
              </FormField>
            </div>
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
            <Button type="button" onClick={() => void guardarCliente()} disabled={isSubmitting}>
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting
                ? 'Guardando…'
                : editingId === null
                  ? 'Crear cliente'
                  : 'Guardar cambios'}
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar cliente"
        description={
          deleteTarget
            ? `¿Eliminar a "${deleteTarget.nombre} ${deleteTarget.apellido}"? El cliente quedará inactivo en el sistema.`
            : undefined
        }
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting}
              onClick={() => void confirmarEliminacion()}
            >
              {isDeleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </>
        }
      >
        {deleteError ? (
          <p role="alert" className="text-sm text-red-600">
            {deleteError}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Esta acción desactiva al cliente. Podrás ver el mensaje de confirmación del
            backend al finalizar.
          </p>
        )}
      </Modal>
    </>
  );
}
