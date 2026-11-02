'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuArrowDownToLine,
  LuArrowUpDown,
  LuArrowUpFromLine,
  LuClipboardList,
  LuFilter,
  LuPlus,
  LuSave,
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
  Pagination,
  SearchInput,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { Reveal } from '@/components/motion';
import { ApiError } from '@/lib/api/client';
import { cargarTodasLasPaginas } from '@/lib/api/paginacion';
import { notifySuccess } from '@/lib/notifications/toast';
import {
  listarMovimientos,
  registrarMovimiento,
  type BackendMovimiento,
  type TipoMovimientoBackend,
} from '@/services/movimientos.service';
import { listarProductos } from '@/services/productos.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;
const PRODUCTOS_PAGE_SIZE = 100;

const TIPO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
];

const PERIODO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ultimos-7', label: 'Últimos 7 días' },
  { value: 'ultimos-30', label: 'Últimos 30 días' },
];

const TIPO_VISUAL: Record<TipoMovimientoBackend, { etiqueta: string; tono: 'success' | 'danger' | 'info' }> = {
  ENTRADA: { etiqueta: 'Entrada', tono: 'success' },
  SALIDA: { etiqueta: 'Salida', tono: 'danger' },
  AJUSTE: { etiqueta: 'Ajuste', tono: 'info' },
};

function formatoFechaHora(iso: string): string {

  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

function formatoCantidad(movimiento: BackendMovimiento): string {
  if (movimiento.tipo === 'ENTRADA') return `+${movimiento.cantidad}`;
  if (movimiento.tipo === 'SALIDA') return `-${movimiento.cantidad}`;
  return `${movimiento.cantidad}`;
}

function inicioDePeriodo(valor: string): number | null {
  if (valor === 'hoy') {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    return inicio.getTime();
  }
  if (valor === 'ultimos-7') return Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (valor === 'ultimos-30') return Date.now() - 30 * 24 * 60 * 60 * 1000;
  return null;
}

const TIPO_BADGE_BORDE: Record<TipoMovimientoBackend, string> = {
  ENTRADA: 'border-green-200',
  SALIDA: 'border-red-200',
  AJUSTE: 'border-blue-200',
};

const MOVIMIENTO_COLUMNAS: TableColumn<BackendMovimiento>[] = [
  {
    key: 'fecha',
    header: 'Fecha',
    render: (row) => (
      <span className="whitespace-nowrap text-[13px] text-zinc-600 tabular-nums">
        {formatoFechaHora(row.fecha)}
      </span>
    ),
  },
  {
    key: 'producto',
    header: 'Producto',
    render: (row) => {
      const nombre = row.producto?.nombre ?? '—';
      return (
        <span
          className="block max-w-50 truncate font-medium text-zinc-900"
          title={nombre}
        >
          {nombre}
        </span>
      );
    },
  },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (row) => {
      const visual = TIPO_VISUAL[row.tipo];
      return (
        <Badge tone={visual.tono} className={`border ${TIPO_BADGE_BORDE[row.tipo]}`}>
          {visual.etiqueta}
        </Badge>
      );
    },
  },
  {
    key: 'cantidad',
    header: 'Cantidad',
    align: 'right',
    render: (row) => (
      <span
        className={`font-semibold whitespace-nowrap tabular-nums ${
          row.tipo === 'ENTRADA'
            ? 'text-green-700'
            : row.tipo === 'SALIDA'
              ? 'text-red-700'
              : 'text-zinc-900'
        }`}
      >
        {formatoCantidad(row)}
      </span>
    ),
  },
  {
    key: 'stockAnterior',
    header: 'Stock anterior',
    align: 'center',
    render: (row) => (
      <span className="text-zinc-600 tabular-nums">{row.stockAnterior}</span>
    ),
  },
  {
    key: 'stockNuevo',
    header: 'Stock nuevo',
    align: 'center',
    render: (row) => (
      <span className="font-semibold text-zinc-900 tabular-nums">{row.stockNuevo}</span>
    ),
  },
  {
    key: 'motivo',
    header: 'Motivo',
    render: (row) =>
      row.motivo?.trim() ? (
        <span
          className="block max-w-60 truncate text-zinc-600"
          title={row.motivo.trim()}
        >
          {row.motivo.trim()}
        </span>
      ) : (
        <span className="text-zinc-400">—</span>
      ),
  },
];

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<BackendMovimiento[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [productoId, setProductoId] = useState('');
  const [tipo, setTipo] = useState<TipoMovimientoBackend>('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [productosOpciones, setProductosOpciones] = useState<
    { value: string; label: string }[]
  >([]);
  const [productosError, setProductosError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [desdePeriodo, setDesdePeriodo] = useState<number | null>(null);
  const [todosMovimientos, setTodosMovimientos] = useState<BackendMovimiento[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const hayFiltros =
    busqueda.trim() !== '' || filtroTipo !== 'todos' || filtroPeriodo !== 'todos';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarMovimientos(pagina, PAGE_SIZE);
      setMovimientos(resultado.movimientos);
      setMeta(resultado.meta);
    } catch (err) {
      setMovimientos([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los movimientos. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarProductos = useCallback(async (): Promise<void> => {
    setIsLoadingProducts(true);
    setProductosError(null);
    try {
      const resultado = await listarProductos(1, PRODUCTOS_PAGE_SIZE);
      setProductosOpciones(
        resultado.productos.map((producto) => ({
          value: String(producto.id),
          label: producto.nombre,
        })),
      );
    } catch (err) {
      setProductosOpciones([]);
      setProductosError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los productos.',
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const cargarTodoParaFiltrar = useCallback(async (): Promise<void> => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      const movimientos = await cargarTodasLasPaginas<BackendMovimiento>('/movimientos');
      setTodosMovimientos(movimientos);
    } catch (err) {
      setTodosMovimientos([]);
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

  function limpiarFormulario(): void {
    setIsFormOpen(false);
    setProductoId('');
    setTipo('ENTRADA');
    setCantidad('');
    setMotivo('');
    setFormError(null);
  }

  function abrirFormulario(): void {
    limpiarFormulario();
    if (productosOpciones.length === 0 && !isLoadingProducts) void cargarProductos();
    setIsFormOpen(true);
  }

  async function guardarMovimiento(): Promise<void> {
    if (isSubmitting) return;
    const productoIdNumero = Number(productoId);
    const cantidadNumero = Number(cantidad);
    if (!Number.isInteger(productoIdNumero) || productoIdNumero <= 0) {
      setFormError('El producto es obligatorio.');
      return;
    }
    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      setFormError('La cantidad debe ser un número entero mayor a 0.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const producto = productosOpciones.find((opcion) => opcion.value === productoId);
      await registrarMovimiento({
        tipo,
        cantidad: cantidadNumero,
        productoId: productoIdNumero,
        ...(motivo.trim() ? { motivo: motivo.trim() } : {}),
      });
      notifySuccess(
        tipo === 'ENTRADA'
          ? 'Entrada de stock registrada'
          : tipo === 'SALIDA'
            ? 'Salida de stock registrada'
            : 'Ajuste de stock registrado',
        producto ? `Inventario actualizado para "${producto.label}".` : 'El inventario fue actualizado.',
      );
      limpiarFormulario();
      if (hayFiltros) {
        await cargarTodoParaFiltrar();
      } else if (page === 1) {
        await cargarPagina(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos registrar el movimiento. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return todosMovimientos.filter((movimiento) => {
      if (
        texto &&
        !`${movimiento.producto?.nombre ?? ''} ${movimiento.motivo ?? ''}`
          .toLowerCase()
          .includes(texto)
      )
        return false;
      if (filtroTipo !== 'todos' && movimiento.tipo !== filtroTipo.toUpperCase())
        return false;
      if (desdePeriodo !== null) {
        const fecha = new Date(movimiento.fecha).getTime();
        if (Number.isNaN(fecha) || fecha < desdePeriodo) return false;
      }
      return true;
    });
  }, [todosMovimientos, busqueda, filtroTipo, desdePeriodo]);

  const totalPaginasVisibles = hayFiltros
    ? Math.max(1, Math.ceil(movimientosFiltrados.length / PAGE_SIZE))
    : meta.totalPaginas;
  const paginaVisible = hayFiltros ? Math.min(page, totalPaginasVisibles) : meta.page;
  const filasTabla = hayFiltros
    ? movimientosFiltrados.slice((paginaVisible - 1) * PAGE_SIZE, paginaVisible * PAGE_SIZE)
    : movimientos;
  const entradasEnPagina = filasTabla.filter((movimiento) => movimiento.tipo === 'ENTRADA').length;
  const salidasEnPagina = filasTabla.filter((movimiento) => movimiento.tipo === 'SALIDA').length;
  const ajustesEnPagina = filasTabla.filter((movimiento) => movimiento.tipo === 'AJUSTE').length;

  return (
    <>
      <PageHeader
        title="Control de stock"
        description="Registrá entradas, salidas y ajustes; consultá el historial de cambios del inventario."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={abrirFormulario}
          >
            <LuPlus aria-hidden="true" size={16} />
            Registrar movimiento
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen del control de stock"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Reveal delay={0}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <LuClipboardList aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Movimientos registrados</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading ? '—' : meta.total.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <LuArrowDownToLine aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Entradas en esta página</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading || isFiltering ? '—' : entradasEnPagina}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <LuArrowUpFromLine aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Salidas en esta página</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading || isFiltering ? '—' : salidasEnPagina}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <LuArrowUpDown aria-hidden="true" size={19} />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">Ajustes en esta página</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-950">
                    {isLoading || isFiltering ? '—' : ajustesEnPagina}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>

        <Reveal delay={0.05}>
          <Card
            title="Buscar en el historial"
            subtitle="Filtrá por producto, motivo, tipo de movimiento o período."
            actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
            className="border-zinc-200/80 shadow-sm"
          >
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <SearchInput
              id="buscar-movimiento"
              label="Producto o motivo"
              placeholder="Ej. Leche, compra a proveedor…"
              value={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPage(1);
              }}
            />
            <Select
              label="Tipo de movimiento"
              value={filtroTipo}
              onChange={(event) => {
                setFiltroTipo(event.target.value);
                setPage(1);
              }}
              options={TIPO_OPCIONES}
            />
            <Select
              label="Período"
              value={filtroPeriodo}
              onChange={(event) => {
                setFiltroPeriodo(event.target.value);
                setDesdePeriodo(inicioDePeriodo(event.target.value));
                setPage(1);
              }}
            options={PERIODO_OPCIONES}
          />
          </div>
          {hayFiltros && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
              <p className="text-xs text-zinc-500">
                {movimientosFiltrados.length.toLocaleString('es-AR')}{' '}
                {movimientosFiltrados.length === 1 ? 'resultado' : 'resultados'}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda('');
                  setFiltroTipo('todos');
                  setFiltroPeriodo('todos');
                  setDesdePeriodo(null);
                  setPage(1);
                }}
              >
                <LuX aria-hidden="true" size={14} />
                Limpiar filtros
              </Button>
            </div>
          )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card
            title="Historial de stock"
            subtitle={
              hayFiltros
                ? `${movimientosFiltrados.length.toLocaleString('es-AR')} resultados`
                : `${meta.total.toLocaleString('es-AR')} movimientos registrados`
            }
            actions={
              <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
                <LuClipboardList aria-hidden="true" size={15} />
                {hayFiltros ? 'Vista filtrada' : 'Todos los registros'}
              </span>
            }
            className="border-zinc-200/80 shadow-sm"
          >
          {isLoading || isFiltering ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-zinc-50" />
              ))}
              <span className="sr-only">Cargando movimientos…</span>
            </div>
          ) : hayFiltros && filterError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{filterError}</p>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void cargarTodoParaFiltrar()}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !hayFiltros && listError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{listError}</p>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={() => void cargarPagina(page)}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={MOVIMIENTO_COLUMNAS}
                data={filasTabla}
                getRowKey={(row) => row.id}
                emptyMessage={
                  hayFiltros
                    ? 'Sin resultados para los filtros aplicados.'
                    : 'Sin movimientos para mostrar.'
                }
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row">
                <p className="text-xs text-zinc-500 tabular-nums">
                  {hayFiltros
                    ? `${movimientosFiltrados.length === 0 ? 0 : (paginaVisible - 1) * PAGE_SIZE + 1}–${Math.min(paginaVisible * PAGE_SIZE, movimientosFiltrados.length)} de ${movimientosFiltrados.length}`
                    : `Página ${paginaVisible} de ${totalPaginasVisibles} · ${meta.total} registros`}
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
        </Reveal>

      </div>

      <Modal
        open={isFormOpen}
        title="Registrar movimiento de stock"
        description="Elegí el producto y registrá cómo cambia su existencia."
        size="lg"
        onClose={() => {
          if (!isSubmitting) limpiarFormulario();
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={limpiarFormulario}
            >
              Cancelar
            </Button>
            <Button type="submit" form="movimiento-formulario" disabled={isSubmitting}>
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting ? 'Registrando…' : 'Registrar movimiento'}
            </Button>
          </>
        }
      >
        <form
          id="movimiento-formulario"
          onSubmit={(event) => {
            event.preventDefault();
            void guardarMovimiento();
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
            <FormField label="Producto" htmlFor="movimiento-producto" required>
              <Select
                id="movimiento-producto"
                value={productoId}
                onChange={(event) => setProductoId(event.target.value)}
                required
                disabled={isLoadingProducts}
                placeholder={isLoadingProducts ? 'Cargando productos…' : 'Seleccionar producto'}
                options={productosOpciones}
              />
            </FormField>
            <FormField label="Tipo de movimiento" htmlFor="movimiento-tipo">
              <Select
                id="movimiento-tipo"
                value={tipo}
                onChange={(event) => setTipo(event.target.value as TipoMovimientoBackend)}
                required
                options={[
                  { value: 'ENTRADA', label: 'Entrada' },
                  { value: 'SALIDA', label: 'Salida' },
                  { value: 'AJUSTE', label: 'Ajuste' },
                ]}
              />
            </FormField>
            <FormField
              label="Cantidad"
              htmlFor="movimiento-cantidad"
              required
              hint={
                tipo === 'AJUSTE'
                ? 'Indicá el stock final que debería quedar para el producto.'
                : tipo === 'ENTRADA'
                  ? 'La cantidad se sumará al stock actual.'
                  : 'La cantidad se descontará del stock actual.'
              }
            >
              <Input
                id="movimiento-cantidad"
                type="number"
                min={1}
                step={1}
                required
                placeholder="0"
                value={cantidad}
                onChange={(event) => setCantidad(event.target.value)}
              />
            </FormField>
            <FormField label="Motivo" htmlFor="movimiento-motivo">
              <Input
                id="movimiento-motivo"
                placeholder="Ej: Compra a proveedor (opcional)"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
              />
            </FormField>
          {productosError && (
            <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <p role="alert" className="text-sm font-medium text-red-700">{productosError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={isLoadingProducts}
                onClick={() => void cargarProductos()}
              >
                {isLoadingProducts ? 'Cargando…' : 'Reintentar carga de productos'}
              </Button>
            </div>
          )}
          {formError && (
            <p
              role="alert"
              className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
            >
              {formError}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
