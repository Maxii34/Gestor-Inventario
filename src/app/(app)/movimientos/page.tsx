'use client';

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  HelpTooltip,
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
import { useSuscripcion } from '@/context/SuscripcionContext';
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
    header: '# Fecha y Hora',
    render: (row) => (
      <span className="whitespace-nowrap text-[13px] text-zinc-600 tabular-nums">
        {formatoFechaHora(row.fecha)}
      </span>
    ),
  },
  {
    key: 'producto',
    header: '# Producto Vendido',
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
    header: '# Tipo',
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
    header: '# Cantidad',
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
    header: '# Stock anterior',
    align: 'center',
    render: (row) => (
      <span className="text-zinc-600 tabular-nums">{row.stockAnterior}</span>
    ),
  },
  {
    key: 'stockNuevo',
    header: '# Stock nuevo',
    align: 'center',
    render: (row) => (
      <span className="font-semibold text-zinc-900 tabular-nums">{row.stockNuevo}</span>
    ),
  },
  {
    key: 'motivo',
    header: '# Motivo',
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
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  const router = useRouter();
  const [movimientos, setMovimientos] = useState<BackendMovimiento[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [productoId, setProductoId] = useState('');
  const [tipo, setTipo] = useState<TipoMovimientoBackend>('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [unidadCantidad, setUnidadCantidad] = useState<'unidad' | 'caja'>('unidad');
  const [motivo, setMotivo] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [productosOpciones, setProductosOpciones] = useState<
    {
      value: string;
      label: string;
      stock: number;
      stockMinimo: number;
      unidadesPorPaquete: number;
    }[]
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
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          unidadesPorPaquete:
            Number.isInteger(Number(producto.unidadesPorPaquete)) &&
            Number(producto.unidadesPorPaquete) > 1
              ? Number(producto.unidadesPorPaquete)
              : 1,
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

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('reponer') !== '1') return;

    startTransition(() => {
      setProductoId(parametros.get('productoId') ?? '');
      setTipo('ENTRADA');
      setCantidad('');
      setUnidadCantidad('unidad');
      setMotivo('');
      setFormError(null);
      setIsFormOpen(true);
    });
    if (productosOpciones.length === 0 && !isLoadingProducts) {
      queueMicrotask(() => {
        void cargarProductos();
      });
    }
    router.replace('/movimientos', { scroll: false });
  }, [cargarProductos, isLoadingProducts, productosOpciones.length, router]);

  function limpiarFormulario(): void {
    setIsFormOpen(false);
    setProductoId('');
    setTipo('ENTRADA');
    setCantidad('');
    setUnidadCantidad('unidad');
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
    const producto = productosOpciones.find((opcion) => opcion.value === productoId);
    const unidadesPaquete = producto?.unidadesPorPaquete ?? 1;
    const usarCajas = tipo === 'ENTRADA' && unidadesPaquete > 1 && unidadCantidad === 'caja';
    if (!Number.isInteger(productoIdNumero) || productoIdNumero <= 0) {
      setFormError('El producto es obligatorio.');
      return;
    }
    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      setFormError('La cantidad debe ser un número entero mayor a 0.');
      return;
    }
    const cantidadUnidades = usarCajas
      ? cantidadNumero * unidadesPaquete
      : cantidadNumero;
    const detalleCajas = usarCajas
      ? `${cantidadNumero} cajas × ${unidadesPaquete}`
      : null;
    const motivoFinal = [motivo.trim(), detalleCajas].filter(Boolean).join(' · ');
    setFormError(null);
    setIsSubmitting(true);
    try {
      const movimiento = await registrarMovimiento({
        tipo,
        cantidad: cantidadUnidades,
        productoId: productoIdNumero,
        ...(motivoFinal ? { motivo: motivoFinal } : {}),
      });
      setProductosOpciones((opciones) =>
        opciones.map((opcion) =>
          opcion.value === productoId
            ? { ...opcion, stock: movimiento.stockNuevo }
            : opcion,
        ),
      );
      notifySuccess(
        tipo === 'ENTRADA'
          ? 'Stock repuesto'
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
  const productosSinStock = productosOpciones.filter((producto) => producto.stock <= 0);
  const productoSeleccionado = productosOpciones.find((producto) => producto.value === productoId);
  const unidadesPaqueteSeleccionado = productoSeleccionado?.unidadesPorPaquete ?? 1;
  const mostrarSelectorCajas =
    tipo === 'ENTRADA' && unidadesPaqueteSeleccionado > 1;
  const cantidadUnidadesVista =
    Number(cantidad) *
    (mostrarSelectorCajas && unidadCantidad === 'caja'
      ? unidadesPaqueteSeleccionado
      : 1);
  const opcionesProducto = productosOpciones.map((producto) => ({
    value: producto.value,
    label: `${producto.label} · Stock ${producto.stock}${
      producto.stock <= producto.stockMinimo ? ' · STOCK BAJO' : ''
    }`,
  }));

  return (
    <>
      <PageHeader
        title="Control de stock"
        description="Reponé stock, registrá salidas por ventas u otros motivos y ajustá existencias. Consultá el historial de cambios del inventario."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={abrirFormulario}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuPlus aria-hidden="true" size={16} />
            Reponer stock
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen del control de stock"
          className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4"
        >
          <Reveal delay={0}>
            <Card className="h-24 border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-10 sm:w-10">
                  <LuClipboardList aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="min-w-0 text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Movimientos registrados</p>
                    <HelpTooltip text="Cantidad total de movimientos guardados en el historial." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading ? '—' : meta.total.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card className="h-24 border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:h-10 sm:w-10">
                  <LuArrowDownToLine aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="min-w-0 text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Reposiciones mostradas.</p>
                    <HelpTooltip text="Reposiciones que aparecen en esta página, teniendo en cuenta los filtros aplicados." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering ? '—' : entradasEnPagina}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-24 border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 sm:h-10 sm:w-10">
                  <LuArrowUpFromLine aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="min-w-0 text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Salidas mostradas.</p>
                    <HelpTooltip text="Salidas que aparecen en esta página, teniendo en cuenta los filtros aplicados." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering ? '—' : salidasEnPagina}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card className="h-24 border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 sm:h-10 sm:w-10">
                  <LuArrowUpDown aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="min-w-0 text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Ajustes de stock.</p>
                    <HelpTooltip text="Ajustes que aparecen en esta página, teniendo en cuenta los filtros aplicados." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
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
                : `${meta.total.toLocaleString('es-AR')} movimientos registrados.`
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
                  compactOnMobile
                />
              </div>
            </>
          )}
          </Card>
        </Reveal>

      </div>

      <Modal
        open={isFormOpen}
        title="Reponer stock"
        description="Elegí el producto y la cantidad que querés agregar. También podés registrar una salida o ajustar las existencias."
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
            <Button
              type="submit"
              form="movimiento-formulario"
              disabled={isSubmitting || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
            >
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting ? 'Registrando…' : 'Guardar movimiento'}
            </Button>
          </>
        }
      >
        {productosSinStock.length > 0 && (
          <section
            aria-labelledby="productos-sin-stock-titulo"
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h3 id="productos-sin-stock-titulo" className="text-sm font-semibold text-amber-950">
                  Productos sin stock
                </h3>
                <p className="text-xs text-amber-800">
                  Seleccioná uno para cargarlo en la reposición.
                </p>
              </div>
              <Badge tone="warning">{productosSinStock.length}</Badge>
            </div>
            <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
              {productosSinStock.map((producto) => (
                <button
                  key={producto.value}
                  type="button"
                  aria-pressed={productoId === producto.value}
                  onClick={() => {
                    setProductoId(producto.value);
                    setTipo('ENTRADA');
                    setFormError(null);
                  }}
                  className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    productoId === producto.value
                      ? 'border-amber-400 bg-amber-100 text-amber-950 ring-2 ring-amber-200'
                      : 'border-amber-200 bg-white text-zinc-700 hover:border-amber-400 hover:bg-amber-100/70'
                  }`}
                  title={`${producto.label} · stock mínimo ${producto.stockMinimo}`}
                >
                  {producto.label}
                </button>
              ))}
            </div>
          </section>
        )}
        <form
          id="movimiento-formulario"
          onSubmit={(event) => {
            event.preventDefault();
            void guardarMovimiento();
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
            <FormField
              label="Producto"
              htmlFor="movimiento-producto"
              required
              hint="Las opciones con “STOCK BAJO” están en el mínimo o por debajo."
            >
              <Select
                id="movimiento-producto"
                value={productoId}
                onChange={(event) => {
                  setProductoId(event.target.value);
                  setUnidadCantidad('unidad');
                }}
                required
                disabled={isLoadingProducts}
                placeholder={isLoadingProducts ? 'Cargando productos…' : 'Seleccionar producto'}
                options={opcionesProducto}
              />
            </FormField>
            {productoSeleccionado && (
              <div
                role="status"
                className={`-mt-2 rounded-lg border px-3 py-2 text-xs sm:col-span-2 ${
                  productoSeleccionado.stock <= productoSeleccionado.stockMinimo
                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                }`}
              >
                <span className="font-semibold">{productoSeleccionado.label}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                Stock actual: <strong>{productoSeleccionado.stock}</strong>
                <span className="mx-1.5" aria-hidden="true">·</span>
                Mínimo: <strong>{productoSeleccionado.stockMinimo}</strong>
                {productoSeleccionado.stock <= productoSeleccionado.stockMinimo && (
                  <span className="ml-2 font-semibold">Stock bajo</span>
                )}
              </div>
            )}
            <FormField label="Tipo de movimiento" htmlFor="movimiento-tipo">
              <Select
                id="movimiento-tipo"
                value={tipo}
                onChange={(event) => {
                  const nuevoTipo = event.target.value as TipoMovimientoBackend;
                  setTipo(nuevoTipo);
                  if (nuevoTipo !== 'ENTRADA') setUnidadCantidad('unidad');
                }}
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
                mostrarSelectorCajas && unidadCantidad === 'caja'
                  ? `= ${Number.isFinite(cantidadUnidadesVista) ? cantidadUnidadesVista : 0} unidades`
                  : tipo === 'AJUSTE'
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
            {mostrarSelectorCajas && (
              <FormField label="Cargar cantidad en" htmlFor="movimiento-unidad">
                <Select
                  id="movimiento-unidad"
                  value={unidadCantidad}
                  onChange={(event) =>
                    setUnidadCantidad(
                      event.target.value as 'unidad' | 'caja',
                    )
                  }
                  options={[
                    { value: 'unidad', label: 'Unidades' },
                    { value: 'caja', label: 'Cajas' },
                  ]}
                />
              </FormField>
            )}
            <FormField label="Proveedor" htmlFor="movimiento-proveedor">
              <Input
                id="movimiento-proveedor"
                placeholder="Nombre del proveedor (opcional)"
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
