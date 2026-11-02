'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuCircleCheck,
  LuCircleOff,
  LuFilter,
  LuFolder,
  LuPencil,
  LuPlus,
  LuSave,
  LuSearch,
  LuTrash2,
  LuX,
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
  Table,
  type TableColumn,
} from '@/components';
import { Reveal } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { notifySuccess } from '@/lib/notifications/toast';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  type BackendCategoria,
} from '@/services/categorias.service';

export default function CategoriasPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [categorias, setCategorias] = useState<BackendCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendCategoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const cargarListado = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      setCategorias(await listarCategorias());
    } catch (err) {
      setCategorias([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar las categorías. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargarListado();
    }
    void cargarInicial();
  }, [cargarListado]);

  const total = categorias.length;
  const activas = categorias.filter((categoria) => categoria.activo).length;

  function comenzarEdicion(categoria: BackendCategoria): void {
    setEditingId(categoria.id);
    setFormError(null);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion ?? '');
    setIsFormOpen(true);
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setIsFormOpen(false);
    setNombre('');
    setDescripcion('');
    setFormError(null);
  }

  function nuevaCategoria(): void {
    cancelarEdicion();
    setIsFormOpen(true);
  }

  async function guardarCategoria(): Promise<void> {
    if (isSubmitting) return;
    if (!nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const input = {
        nombre: nombre.trim(),
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
      };
      const esEdicion = editingId !== null;
      if (!esEdicion) {
        await crearCategoria(input);
      } else {
        await actualizarCategoria(editingId, input);
      }
      notifySuccess(
        esEdicion ? 'Categoría actualizada' : 'Categoría creada',
        `"${input.nombre}" ya está disponible en el catálogo.`,
      );
      cancelarEdicion();
      await cargarListado();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar la categoría. Inténtalo nuevamente.',
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
      const nombreCategoria = deleteTarget.nombre;
      await eliminarCategoria(deleteTarget.id);
      notifySuccess('Categoría eliminada', `"${nombreCategoria}" se quitó del catálogo.`);
      setDeleteTarget(null);
      await cargarListado();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos eliminar la categoría. Inténtalo nuevamente.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return categorias;
    return categorias.filter((categoria) =>
      [categoria.nombre, categoria.descripcion ?? ''].some((valor) =>
        valor.toLocaleLowerCase('es-AR').includes(texto),
      ),
    );
  }, [categorias, busqueda]);

  const columnas: TableColumn<BackendCategoria>[] = [
    {
      key: 'nombre',
      header: 'Categoría',
      render: (row) => (
        <span className="block max-w-55 truncate font-semibold text-zinc-900" title={row.nombre}>
          {row.nombre}
        </span>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (row) =>
        row.descripcion?.trim() ? (
          <span
            className="block max-w-[320px] truncate text-zinc-600"
            title={row.descripcion.trim()}
          >
            {row.descripcion.trim()}
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        ),
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (row) => (
        <Badge
          tone={row.activo ? 'success' : 'neutral'}
          className={`border ${row.activo ? 'border-green-200' : 'border-zinc-200'}`}
        >
          {row.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
  ];

  if (isAdmin) {
    columnas.push({
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <span className="inline-flex gap-1 whitespace-nowrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Editar ${row.nombre}`}
            onClick={() => comenzarEdicion(row)}
            className="hover:border-zinc-200 hover:bg-zinc-100"
          >
            <LuPencil aria-hidden="true" size={14} />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Eliminar ${row.nombre}`}
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(row);
            }}
            className="text-zinc-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LuTrash2 aria-hidden="true" size={14} />
            Eliminar
          </Button>
        </span>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organizá los productos en grupos claros para encontrarlos y gestionarlos mejor."
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen de categorías"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Reveal delay={0}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <LuFolder aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Total de categorías</p>
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
                  <p className="text-xs font-medium text-zinc-500">Categorías activas</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : activas.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <LuCircleOff aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Categorías inactivas</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : (total - activas).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>

        <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'lg:grid-cols-2' : ''}`}>
          <Reveal delay={0.2}>
            <Card
              title="Encontrar una categoría"
              subtitle="Buscá por nombre o descripción."
              actions={<LuSearch aria-hidden="true" size={17} className="text-zinc-400" />}
              className="h-full border-zinc-200/80 shadow-sm"
            >
              <SearchInput
                id="buscar-categoria"
                label="Nombre o descripción"
                placeholder="Ej. Bebidas, productos de limpieza…"
                value={busqueda}
                onChange={setBusqueda}
              />
              {busqueda.trim() && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                  <p className="text-xs text-zinc-500">
                    {categoriasFiltradas.length.toLocaleString('es-AR')}{' '}
                    {categoriasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setBusqueda('')}>
                    <LuX aria-hidden="true" size={14} />
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </Card>
          </Reveal>

          {isAdmin && (
            <Reveal delay={0.25}>
              <Card
                title="¿Necesitás otro grupo?"
                subtitle="Creá una categoría para organizar nuevos productos."
                className="h-full border-zinc-200/80 bg-zinc-50/60 shadow-sm"
              >
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={nuevaCategoria}
                >
                  <LuPlus aria-hidden="true" size={16} />
                  Nueva categoría
                </Button>
              </Card>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.25}>
          <Card
            title="Categorías"
            subtitle={
              busqueda.trim()
                ? `${categoriasFiltradas.length.toLocaleString('es-AR')} resultados de ${total}`
                : `${total.toLocaleString('es-AR')} categorías registradas`
            }
            actions={
              <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
                <LuFilter aria-hidden="true" size={15} />
                {busqueda.trim() ? 'Vista filtrada' : 'Todas las categorías'}
              </span>
            }
            className="border-zinc-200/80 shadow-sm"
          >
          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-zinc-50" />
              ))}
              <span className="sr-only">Cargando categorías…</span>
            </div>
          ) : listError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{listError}</p>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={() => void cargarListado()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <Table
              columns={columnas}
              data={categoriasFiltradas}
              getRowKey={(row) => row.id}
              emptyMessage={
                busqueda.trim()
                  ? 'No encontramos categorías con esa búsqueda.'
                  : 'Todavía no hay categorías registradas.'
              }
            />
          )}
          </Card>
        </Reveal>
      </div>

      {isAdmin && (
        <Modal
          open={isFormOpen}
          title={editingId === null ? 'Nueva categoría' : 'Editar categoría'}
          description={
            editingId === null
              ? 'Agregá una categoría para organizar los productos del catálogo.'
              : 'Actualizá el nombre o la descripción de esta categoría.'
          }
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
              <Button type="submit" form="categoria-formulario" disabled={isSubmitting}>
                <LuSave aria-hidden="true" size={16} />
                {isSubmitting
                  ? 'Guardando…'
                  : editingId === null
                    ? 'Crear categoría'
                    : 'Guardar cambios'}
              </Button>
            </>
          }
        >
          <form
            id="categoria-formulario"
            onSubmit={(event) => {
              event.preventDefault();
              void guardarCategoria();
            }}
            className="flex flex-col gap-4"
          >
            <FormField label="Nombre" htmlFor="categoria-nombre" required>
              <Input
                id="categoria-nombre"
                placeholder="Ej: Electrónica"
                autoFocus
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </FormField>
            <FormField label="Descripción" htmlFor="categoria-descripcion">
              <Input
                id="categoria-descripcion"
                placeholder="Descripción breve (opcional)"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
              />
            </FormField>
            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
              >
                {formError}
              </p>
            )}
          </form>
        </Modal>
      )}

      <Modal
        open={deleteTarget !== null}
        title="Eliminar categoría"
        description={
          deleteTarget
            ? `¿Eliminar "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`
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
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {deleteError}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-600">
            Si la categoría tiene productos asociados, el sistema rechazará la eliminación.
          </p>
        )}
      </Modal>
    </>
  );
}