'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Checkbox,
  FormField,
  HelpTooltip,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Table,
  type TableColumn,
} from '@/components';
import { Reveal } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { useSuscripcion } from '@/context/SuscripcionContext';
import { ApiError } from '@/lib/api/client';
import { notifySuccess } from '@/lib/notifications/toast';
import type { PageMeta } from '@/types/api';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  listarCategoriasPaginadas,
  type BackendCategoria,
} from '@/services/categorias.service';

const PAGE_SIZE = 10;

export default function CategoriasPage() {
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  const isAdmin = user?.rol === 'ADMIN';

  const [categorias, setCategorias] = useState<BackendCategoria[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [todasCategorias, setTodasCategorias] = useState<BackendCategoria[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const resumenCategoriasCargado = useRef(false);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendCategoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const hayFiltros = busqueda.trim() !== '';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarCategoriasPaginadas(pagina, PAGE_SIZE);
      setCategorias(resultado.categorias);
      setMeta(resultado.meta);
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

  const cargarTodasParaFiltrar = useCallback(async (): Promise<void> => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      setTodasCategorias(await listarCategorias());
    } catch (err) {
      setTodasCategorias([]);
      setFilterError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos aplicar la búsqueda. Inténtalo nuevamente.',
      );
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const cargarListado = useCallback(async (pagina = page): Promise<void> => {
    if (hayFiltros) {
      await cargarTodasParaFiltrar();
    } else {
      await Promise.all([cargarPagina(pagina), cargarTodasParaFiltrar()]);
    }
  }, [cargarPagina, cargarTodasParaFiltrar, hayFiltros, page]);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      if (hayFiltros) {
        await cargarTodasParaFiltrar();
      } else {
        const cargarResumen = !resumenCategoriasCargado.current;
        resumenCategoriasCargado.current = true;
        await Promise.all([
          cargarPagina(page),
          cargarResumen ? cargarTodasParaFiltrar() : Promise.resolve(),
        ]);
      }
    }
    void cargarInicial();
  }, [cargarPagina, cargarTodasParaFiltrar, hayFiltros, page]);

  const categoriasBase = hayFiltros ? todasCategorias : categorias;
  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return categoriasBase;
    return categoriasBase.filter((categoria) =>
      [categoria.nombre, categoria.descripcion ?? ''].some((valor) =>
        valor.toLocaleLowerCase('es-AR').includes(texto),
      ),
    );
  }, [categoriasBase, busqueda]);
  const total = hayFiltros ? todasCategorias.length : meta.total;
  const activas = todasCategorias.filter((categoria) => categoria.activo).length;
  const totalPaginasVisibles = hayFiltros
    ? Math.max(1, Math.ceil(categoriasFiltradas.length / PAGE_SIZE))
    : Math.max(1, meta.totalPaginas);
  const paginaVisible = Math.min(page, totalPaginasVisibles);
  const filasTabla = hayFiltros
    ? categoriasFiltradas.slice((paginaVisible - 1) * PAGE_SIZE, paginaVisible * PAGE_SIZE)
    : categorias;

  function comenzarEdicion(categoria: BackendCategoria): void {
    setEditingId(categoria.id);
    setFormError(null);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion ?? '');
    setActivo(categoria.activo);
    setIsFormOpen(true);
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setIsFormOpen(false);
    setNombre('');
    setDescripcion('');
    setActivo(true);
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
      const esEdicion = editingId !== null;
      const input = {
        nombre: nombre.trim(),
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
        ...(esEdicion ? { activo } : {}),
      };
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
      if (!hayFiltros && categorias.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await cargarListado();
      }
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

  const columnas: TableColumn<BackendCategoria>[] = [
    {
      key: 'nombre',
      header: '# Categoría',
      render: (row) => (
        <span className="block max-w-55 truncate font-semibold text-zinc-900" title={row.nombre}>
          {row.nombre}
        </span>
      ),
    },
    {
      key: 'descripcion',
      header: '# Descripción',
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
      header: '# Estado',
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
      header: '# Acciones',
      align: 'right',
      render: (row) => (
        <span className="inline-flex gap-1 whitespace-nowrap">
          <Button
            type="button"
            variant="action"
            size="sm"
            aria-label={`Editar ${row.nombre}`}
            onClick={() => comenzarEdicion(row)}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuPencil aria-hidden="true" size={14} />
            Editar
          </Button>
          <Button
            type="button"
            variant="actionDanger"
            size="sm"
            aria-label={`Eliminar ${row.nombre}`}
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(row);
            }}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
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
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        >
          <Reveal delay={0}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-10 sm:w-10">
                  <LuFolder aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Categorías</p>
                    <HelpTooltip text="Cantidad total de categorías registradas, activas e inactivas." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isFiltering || filterError
                      ? '—'
                      : todasCategorias.length.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:h-10 sm:w-10">
                  <LuCircleCheck aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">
                      Activas
                    </p>
                    <HelpTooltip text="Cantidad de categorías marcadas como activas en todo el catálogo." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isFiltering || filterError ? '—' : activas.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 sm:h-10 sm:w-10">
                  <LuCircleOff aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">
                      Inactivas
                    </p>
                    <HelpTooltip text="Cantidad de categorías marcadas como inactivas en todo el catálogo." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isFiltering || filterError
                      ? '—'
                      : (todasCategorias.length - activas).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>

        {filterError && !hayFiltros && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">
              No pudimos actualizar el resumen de categorías: {filterError}
            </p>
            <div className="mt-3">
              <Button type="button" variant="outline" onClick={() => void cargarTodasParaFiltrar()}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

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
                onChange={(valor) => {
                  setBusqueda(valor);
                  setPage(1);
                }}
              />
              {busqueda.trim() && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                  <p className="text-xs text-zinc-500">
                    {categoriasFiltradas.length.toLocaleString('es-AR')}{' '}
                    {categoriasFiltradas.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBusqueda('');
                      setPage(1);
                    }}
                  >
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
                  disabled={soloLectura}
                  title={soloLectura ? motivoSoloLectura : undefined}
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
          {isLoading || isFiltering ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-zinc-50" />
              ))}
              <span className="sr-only">Cargando categorías…</span>
            </div>
          ) : hayFiltros && filterError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{filterError}</p>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={() => void cargarTodasParaFiltrar()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !hayFiltros && listError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{listError}</p>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={() => void cargarListado()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={columnas}
                data={filasTabla}
                getRowKey={(row) => row.id}
                emptyMessage={
                  busqueda.trim()
                    ? 'No encontramos categorías con esa búsqueda.'
                    : 'Todavía no hay categorías registradas.'
                }
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-zinc-500">
                  {hayFiltros
                    ? `${categoriasFiltradas.length === 0 ? 0 : (paginaVisible - 1) * PAGE_SIZE + 1}–${Math.min(paginaVisible * PAGE_SIZE, categoriasFiltradas.length)} de ${categoriasFiltradas.length}`
                    : `Página ${paginaVisible} de ${totalPaginasVisibles} · ${meta.total} categorías`}
                </p>
                <Pagination
                  page={paginaVisible}
                  totalPages={totalPaginasVisibles}
                  onPageChange={setPage}
                  compactOnMobile
                />
              </div>
            </>
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
              <Button
                type="submit"
                form="categoria-formulario"
                disabled={isSubmitting || soloLectura}
                title={soloLectura ? motivoSoloLectura : undefined}
              >
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
            {editingId !== null && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <Checkbox
                  id="categoria-activa"
                  label="Categoría activa"
                  checked={activo}
                  disabled={isSubmitting || soloLectura}
                  onChange={(event) => setActivo(event.target.checked)}
                />
                <p className="ml-6 mt-1 text-xs leading-5 text-zinc-500">
                  Si la desactivás, se conserva y podés volver a activarla más adelante.
                </p>
              </div>
            )}
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
            ? `Estás por eliminar la categoría "${deleteTarget.nombre}". Esta acción no se puede deshacer.`
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
              disabled={isDeleting || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
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
            Solo podés eliminar categorías sin productos asociados. Si querés conservarla
            sin que siga disponible, podés desactivarla desde la opción Editar.
          </p>
        )}
      </Modal>
    </>
  );
}