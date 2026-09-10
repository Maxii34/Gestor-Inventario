'use client';

import { useCallback, useEffect, useState } from 'react';
import { LuFilter, LuPlus, LuSave } from 'react-icons/lu';
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
import { ApiError } from '@/lib/api/client';
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

const MOVIMIENTO_COLUMNAS: TableColumn<BackendMovimiento>[] = [
  { key: 'fecha', header: 'Fecha', render: (row) => formatoFechaHora(row.fecha) },
  {
    key: 'producto',
    header: 'Producto',
    render: (row) => row.producto?.nombre ?? '—',
  },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (row) => {
      const visual = TIPO_VISUAL[row.tipo];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'cantidad',
    header: 'Cantidad',
    align: 'right',
    render: (row) => <span className="font-medium">{formatoCantidad(row)}</span>,
  },
  { key: 'stockAnterior', header: 'Stock anterior', align: 'center' },
  { key: 'stockNuevo', header: 'Stock nuevo', align: 'center' },
  {
    key: 'motivo',
    header: 'Motivo',
    render: (row) => row.motivo?.trim() || '—',
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

  const [productosOpciones, setProductosOpciones] = useState<
    { value: string; label: string }[]
  >([]);
  const [productosError, setProductosError] = useState<string | null>(null);

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
    }
  }, []);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargarPagina(1);
      await cargarProductos();
    }
    void cargarInicial();
  }, [cargarPagina, cargarProductos]);

  useEffect(() => {
    if (page === 1) return;
    async function cargarInicial(): Promise<void> {
      await cargarPagina(page);
    }
    void cargarInicial();
  }, [page, cargarPagina]);

  function limpiarFormulario(): void {
    setProductoId('');
    setTipo('ENTRADA');
    setCantidad('');
    setMotivo('');
    setFormError(null);
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
      await registrarMovimiento({
        tipo,
        cantidad: cantidadNumero,
        productoId: productoIdNumero,
        ...(motivo.trim() ? { motivo: motivo.trim() } : {}),
      });
      limpiarFormulario();
      if (page === 1) {
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

  return (
    <>
      <PageHeader
        title="Movimientos de stock"
        description="Consulta y registra los movimientos de inventario."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() =>
              document.getElementById('movimiento-formulario')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <LuPlus aria-hidden="true" size={16} />
            Registrar movimiento
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Movimientos totales">
            <p className="text-2xl font-bold text-zinc-900">{meta.total}</p>
            <p className="mt-1 text-xs text-zinc-500">registrados en el sistema</p>
          </Card>
        </div>

        <Card
          title="Filtros"
          subtitle="Controles visuales sin funcionalidad"
          actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SearchInput
              id="buscar-movimiento"
              label="Buscar"
              placeholder="Buscar producto o motivo..."
              value=""
              onChange={() => undefined}
            />
            <Select
              label="Tipo de movimiento"
              defaultValue="todos"
              options={TIPO_OPCIONES}
            />
            <Select label="Período" defaultValue="todos" options={PERIODO_OPCIONES} />
          </div>
        </Card>

        <Card title="Historial de movimientos" subtitle={`${meta.total} movimientos registrados`}>
          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando movimientos…</span>
            </div>
          ) : listError ? (
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
                columns={MOVIMIENTO_COLUMNAS}
                data={movimientos}
                getRowKey={(row) => row.id}
                emptyMessage="Sin movimientos para mostrar."
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-zinc-500">
                  Página {meta.page} de {meta.totalPaginas}
                </p>
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPaginas}
                  onPageChange={(nuevaPagina) => setPage(nuevaPagina)}
                />
              </div>
            </>
          )}
        </Card>

        <Card title="Registrar movimiento" subtitle="Formulario conectado al backend">
          <div id="movimiento-formulario" className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Producto" htmlFor="movimiento-producto">
              <Select
                id="movimiento-producto"
                value={productoId}
                onChange={(event) => setProductoId(event.target.value)}
                placeholder="Seleccionar producto"
                options={productosOpciones}
              />
            </FormField>
            <FormField label="Tipo de movimiento" htmlFor="movimiento-tipo">
              <Select
                id="movimiento-tipo"
                value={tipo}
                onChange={(event) => setTipo(event.target.value as TipoMovimientoBackend)}
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
              hint={
                tipo === 'AJUSTE'
                  ? 'En un ajuste, la cantidad será el stock resultante.'
                  : undefined
              }
            >
              <Input
                id="movimiento-cantidad"
                type="number"
                min={1}
                step={1}
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
          </div>
          {productosError && (
            <p className="mt-2 text-xs text-red-600">{productosError}</p>
          )}
          {formError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={limpiarFormulario}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void guardarMovimiento()} disabled={isSubmitting}>
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting ? 'Registrando…' : 'Registrar movimiento'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
