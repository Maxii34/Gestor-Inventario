'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LuEye,
  LuPlus,
  LuReceipt,
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
import { useAuth } from '@/context/AuthContext';
import {
  RecaudacionConsultaCard,
  RecaudacionTotalCard,
  useRecaudacion,
} from '@/components/estadisticas';
import { ApiError } from '@/lib/api/client';
import { MODULO_CLIENTES } from '@/lib/config';
import { notifySuccess } from '@/lib/notifications/toast';
import { listarClientes } from '@/services/clientes.service';
import { listarProductos } from '@/services/productos.service';
import {
  anularVenta,
  crearVenta,
  listarVentas,
  obtenerVenta,
  type BackendVenta,
  type BackendVentaDetalle,
  type EstadoVentaBackend,
  type MetodoPagoBackend,
} from '@/services/ventas.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;
const SELECTOR_PAGE_SIZE = 100;

const NUEVA_VENTA_MEDIO_PAGO_OPCIONES = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
];

const ESTADO_VISUAL: Record<EstadoVentaBackend, { etiqueta: string; tono: 'success' | 'warning' | 'danger' }> = {
  PENDIENTE: { etiqueta: 'Pendiente', tono: 'warning' },
  COMPLETADA: { etiqueta: 'Pagada', tono: 'success' },
  ANULADA: { etiqueta: 'Cancelada', tono: 'danger' },
  RECHAZADA: { etiqueta: 'Rechazada', tono: 'danger' },
};

const METODO_PAGO_ETIQUETA: Record<MetodoPagoBackend, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
};

function toNumber(valor: number | string): number {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  return Number.isFinite(numero) ? numero : 0;
}

function formatoMoneda(valor: number | string): string {
  return `$${toNumber(valor).toLocaleString('es-AR')}`;
}

function formatoFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

interface FilaVenta extends BackendVenta {
  onVerDetalle: () => void;
  onAnular: () => void;
  puedeAnular: boolean;
}

const VENTA_COLUMNAS: TableColumn<FilaVenta>[] = [
  { key: 'id', header: 'Venta', render: (row) => `#${row.id}` },
  {
    key: 'cliente',
    header: 'Cliente',
    render: (row) =>
      row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido}`.trim() : 'Consumidor final',
  },
  { key: 'fecha', header: 'Fecha', render: (row) => formatoFecha(row.fecha) },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (row) => formatoMoneda(row.total),
  },
  {
    key: 'metodoPago',
    header: 'Medio de pago',
    render: (row) => METODO_PAGO_ETIQUETA[row.metodoPago] ?? row.metodoPago,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => {
      const visual = ESTADO_VISUAL[row.estado];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
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
          aria-label={`Ver detalle de la venta #${row.id}`}
          onClick={row.onVerDetalle}
        >
          <LuEye aria-hidden="true" size={14} />
          Ver detalle
        </Button>
        {row.estado === 'COMPLETADA' && row.puedeAnular && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Anular la venta #${row.id}`}
            onClick={row.onAnular}
          >
            <LuX aria-hidden="true" size={14} />
            Anular
          </Button>
        )}
      </span>
    ),
  },
];

interface ItemNuevaVenta {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stock: number;
}

interface ProductoOpcion {
  value: string;
  label: string;
  precio: number;
  stock: number;
}

const DETALLE_COLUMNAS: TableColumn<ItemNuevaVenta & { onQuitar: () => void }>[] = [
  { key: 'nombre', header: 'Producto' },
  {
    key: 'precioUnitario',
    header: 'Precio',
    align: 'right',
    render: (row) => formatoMoneda(row.precioUnitario),
  },
  { key: 'cantidad', header: 'Cantidad', align: 'center' },
  {
    key: 'subtotal',
    header: 'Subtotal',
    align: 'right',
    render: (row) => formatoMoneda(row.precioUnitario * row.cantidad),
  },
  {
    key: 'accion',
    header: 'Acción',
    align: 'right',
    render: (row) => (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Quitar ${row.nombre}`}
        onClick={row.onQuitar}
      >
        <LuX aria-hidden="true" size={14} />
        Quitar
      </Button>
    ),
  },
];

const DETALLE_VENTA_COLUMNAS: TableColumn<BackendVentaDetalle>[] = [
  {
    key: 'producto',
    header: 'Producto',
    render: (row) => row.producto?.nombre ?? `Producto #${row.productoId}`,
  },
  {
    key: 'precioUnitario',
    header: 'Precio',
    align: 'right',
    render: (row) => formatoMoneda(row.precioUnitario),
  },
  { key: 'cantidad', header: 'Cantidad', align: 'center' },
  {
    key: 'subtotal',
    header: 'Subtotal',
    align: 'right',
    render: (row) => formatoMoneda(row.subtotal),
  },
];

export default function VentasPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [ventas, setVentas] = useState<BackendVenta[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<BackendVenta | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  const [anularTarget, setAnularTarget] = useState<BackendVenta | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isAnulando, setIsAnulando] = useState(false);
  const [anularError, setAnularError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [clienteOpciones, setClienteOpciones] = useState<{ value: string; label: string }[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productoOpciones, setProductoOpciones] = useState<ProductoOpcion[]>([]);
  const [isLoadingSelectors, setIsLoadingSelectors] = useState(true);
  const [selectoresError, setSelectoresError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemNuevaVenta[]>([]);
  const [medioPago, setMedioPago] = useState<MetodoPagoBackend>('EFECTIVO');
  const [ventaError, setVentaError] = useState<string | null>(null);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [isVentaOpen, setIsVentaOpen] = useState(false);

  const recaudacion = useRecaudacion();

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarVentas(pagina, PAGE_SIZE);
      setVentas(resultado.ventas);
      setMeta(resultado.meta);
    } catch (err) {
      setVentas([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar las ventas. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarSelectores = useCallback(async (): Promise<void> => {
    setIsLoadingSelectors(true);
    setSelectoresError(null);
    try {
      const [clientes, productos] = await Promise.all([
        MODULO_CLIENTES ? listarClientes(1, SELECTOR_PAGE_SIZE) : Promise.resolve(null),
        listarProductos(1, SELECTOR_PAGE_SIZE),
      ]);
      setClienteOpciones(
        clientes
          ? clientes.clientes.map((cliente) => ({
              value: String(cliente.id),
              label: `${cliente.nombre} ${cliente.apellido}`.trim(),
            }))
          : [],
      );
      setProductoOpciones(
        productos.productos
          .filter((producto) => producto.activo)
          .map((producto) => ({
            value: String(producto.id),
            label: producto.nombre,
            precio: toNumber(producto.precioVenta),
            stock: producto.stock,
          })),
      );
    } catch (err) {
      setClienteOpciones([]);
      setProductoOpciones([]);
      setSelectoresError(
        err instanceof ApiError
          ? err.message
          : MODULO_CLIENTES
            ? 'No pudimos cargar clientes y productos.'
            : 'No pudimos cargar los productos.',
      );
    } finally {
      setIsLoadingSelectors(false);
    }
  }, []);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      await cargarPagina(1);
      await cargarSelectores();
    }
    void cargarInicial();
  }, [cargarPagina, cargarSelectores]);

  useEffect(() => {
    if (page === 1) return;
    async function cargarInicial(): Promise<void> {
      await cargarPagina(page);
    }
    void cargarInicial();
  }, [page, cargarPagina]);

  async function verDetalle(id: number): Promise<void> {
    setDetalleId(id);
    setDetalle(null);
    setDetalleError(null);
    setDetalleLoading(true);
    try {
      setDetalle(await obtenerVenta(id));
    } catch (err) {
      setDetalleError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar el detalle de la venta.',
      );
    } finally {
      setDetalleLoading(false);
    }
  }

  async function confirmarAnulacion(): Promise<void> {
    if (!anularTarget || isAnulando) return;
    const motivoLimpio = motivoAnulacion.trim();
    if (!motivoLimpio) {
      setAnularError('El motivo de anulación es obligatorio.');
      return;
    }
    setAnularError(null);
    setIsAnulando(true);
    try {
      const idAnulada = anularTarget.id;
      await anularVenta(idAnulada, motivoLimpio);
      notifySuccess('Venta anulada', `La venta #${idAnulada} quedó anulada correctamente.`);
      setAnularTarget(null);
      setMotivoAnulacion('');
      await cargarPagina(page);
      await cargarSelectores();
      if (detalleId === idAnulada) {
        await verDetalle(idAnulada);
      }
    } catch (err) {
      setAnularError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos anular la venta. Inténtalo nuevamente.',
      );
    } finally {
      setIsAnulando(false);
    }
  }

  function agregarItem(opcion: ProductoOpcion): void {
    setVentaError(null);
    const existente = items.find((item) => item.productoId === Number(opcion.value));
    const cantidadTotal = (existente?.cantidad ?? 0) + 1;
    if (cantidadTotal > opcion.stock) {
      setVentaError(`Stock disponible de "${opcion.label}": ${opcion.stock}.`);
      return;
    }
    if (existente) {
      setItems(
        items.map((item) =>
          item.productoId === existente.productoId
            ? { ...item, cantidad: cantidadTotal }
            : item,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          productoId: Number(opcion.value),
          nombre: opcion.label,
          precioUnitario: opcion.precio,
          cantidad: 1,
          stock: opcion.stock,
        },
      ]);
    }
  }

  function quitarItem(productoIdQuitar: number): void {
    setItems(items.filter((item) => item.productoId !== productoIdQuitar));
  }

  function reiniciarCamposVenta(): void {
    setClienteId('');
    setBusquedaProducto('');
    setItems([]);
    setMedioPago('EFECTIVO');
    setVentaError(null);
  }

  function limpiarNuevaVenta(): void {
    reiniciarCamposVenta();
    setIsVentaOpen(false);
  }

  function abrirNuevaVenta(): void {
    reiniciarCamposVenta();
    setIsVentaOpen(true);
  }

  async function registrarVenta(): Promise<void> {
    if (isRegistrando) return;
    if (items.length === 0) {
      setVentaError('Agregá al menos un producto a la venta.');
      return;
    }
    setVentaError(null);
    setIsRegistrando(true);
    try {
      const creada = await crearVenta({
        ...(MODULO_CLIENTES && clienteId ? { clienteId: Number(clienteId) } : {}),
        metodoPago: medioPago,
        detalles: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      });
      notifySuccess('Venta registrada', `La venta #${creada.ventaId} quedó confirmada.`);
      limpiarNuevaVenta();
      if (page === 1) {
        await cargarPagina(1);
      } else {
        setPage(1);
      }
      await cargarSelectores();
      void recaudacion.consultar(recaudacion.desde, recaudacion.hasta);
    } catch (err) {
      setVentaError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos registrar la venta. Inténtalo nuevamente.',
      );
    } finally {
      setIsRegistrando(false);
    }
  }

  const filas: FilaVenta[] = ventas.map((venta) => ({
    ...venta,
    onVerDetalle: () => void verDetalle(venta.id),
    onAnular: () => {
      setAnularError(null);
      setMotivoAnulacion('');
      setAnularTarget(venta);
    },
    puedeAnular: isAdmin,
  }));

  const totalEstimado = items.reduce(
    (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
    0,
  );
  const textoBusquedaProducto = busquedaProducto.trim().toLocaleLowerCase('es-AR');
  const productosFiltrados = productoOpciones.filter((producto) =>
    producto.label.toLocaleLowerCase('es-AR').includes(textoBusquedaProducto),
  );

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Registrá operaciones, consultá su recaudación y revisá el historial de ventas."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={abrirNuevaVenta}
          >
            <LuPlus aria-hidden="true" size={16} />
            Nueva venta
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen de ventas"
          className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2"
        >
          <Reveal delay={0}>
            <Card className="h-full border-zinc-200/80 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-600">Ventas registradas</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                    {isLoading ? '—' : meta.total.toLocaleString('es-AR')}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Operaciones en todo el historial</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <LuReceipt aria-hidden="true" size={20} />
                </span>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <RecaudacionTotalCard
              datos={recaudacion.datos}
              isLoading={recaudacion.isLoading}
              error={recaudacion.error}
            />
          </Reveal>
        </section>

        <Reveal delay={0.1}>
          <RecaudacionConsultaCard
            desde={recaudacion.desde}
            setDesde={recaudacion.setDesde}
            hasta={recaudacion.hasta}
            setHasta={recaudacion.setHasta}
            isLoading={recaudacion.isLoading}
            consultar={recaudacion.consultar}
            aplicarRango={recaudacion.aplicarRango}
          />
        </Reveal>

        <Reveal delay={0.15}>
          <Card
            title="Historial de ventas"
            subtitle={`${meta.total.toLocaleString('es-AR')} ventas registradas`}
            actions={
              <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
                <LuReceipt aria-hidden="true" size={15} />
                Página {meta.page} de {meta.totalPaginas}
              </span>
            }
            className="border-zinc-200/80 shadow-sm"
          >
            {isLoading ? (
              <div className="flex flex-col gap-2" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
                ))}
                <span className="sr-only">Cargando ventas…</span>
              </div>
            ) : listError ? (
              <div>
                <p role="alert" className="text-sm text-red-700">{listError}</p>
                <div className="mt-4">
                  <Button type="button" onClick={() => void cargarPagina(page)}>
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Table
                  columns={VENTA_COLUMNAS}
                  data={filas}
                  getRowKey={(row) => row.id}
                  emptyMessage="Todavía no hay ventas. Al registrar una, aparecerá en este historial."
                />
                <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row">
                  <p className="text-xs text-zinc-500 tabular-nums">
                    Página {meta.page} de {meta.totalPaginas} · {meta.total} ventas
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
        </Reveal>

      </div>

      <Modal
        open={isVentaOpen}
        title="Registrar una venta"
        description="Agregá los productos, verificá el total y confirmá el medio de pago."
        size="xl"
        onClose={() => {
          if (!isRegistrando) limpiarNuevaVenta();
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isRegistrando}
              onClick={limpiarNuevaVenta}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="nueva-venta-formulario"
              disabled={isRegistrando || isLoadingSelectors || !!selectoresError}
            >
              <LuSave aria-hidden="true" size={16} />
              {isRegistrando ? 'Registrando…' : 'Confirmar venta'}
            </Button>
          </>
        }
      >
        <form
          id="nueva-venta-formulario"
          onSubmit={(event) => {
            event.preventDefault();
            void registrarVenta();
          }}
          className="flex flex-col gap-5"
        >
            {MODULO_CLIENTES && (
              <FormField label="Cliente" htmlFor="nueva-venta-cliente">
                <Select
                  id="nueva-venta-cliente"
                  value={clienteId}
                  onChange={(event) => setClienteId(event.target.value)}
                  disabled={isLoadingSelectors}
                  placeholder="Consumidor final"
                  options={clienteOpciones}
                />
              </FormField>
            )}

            <section aria-labelledby="nueva-venta-productos-titulo">
              <div className="mb-3">
                <h3 id="nueva-venta-productos-titulo" className="text-sm font-semibold text-zinc-900">
                  Productos de la venta
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Buscá un producto y tocá su opción para agregar una unidad al carrito.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <SearchInput
                  id="buscar-producto-venta"
                  label="Buscar producto"
                  placeholder="Escribí el nombre del producto…"
                  value={busquedaProducto}
                  disabled={isLoadingSelectors || !!selectoresError}
                  onChange={(valor) => {
                    setBusquedaProducto(valor);
                    setVentaError(null);
                  }}
                />
                {!textoBusquedaProducto ? null : isLoadingSelectors ? (
                  <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500">
                    Cargando productos…
                  </p>
                ) : !selectoresError && productosFiltrados.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-center text-sm text-zinc-500">
                    No encontramos productos con ese nombre.
                  </p>
                ) : (
                  <ul
                    aria-label="Productos disponibles para agregar a la venta"
                    className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
                  >
                    {productosFiltrados.map((opcion) => {
                      const cantidadEnCarrito =
                        items.find((item) => item.productoId === Number(opcion.value))?.cantidad ?? 0;
                      const stockRestante = Math.max(0, opcion.stock - cantidadEnCarrito);
                      const sinStock = stockRestante === 0;

                      return (
                        <li key={opcion.value}>
                          <button
                            type="button"
                            disabled={sinStock || isRegistrando}
                            aria-label={
                              sinStock
                                ? `${opcion.label}, sin unidades disponibles`
                                : `Agregar una unidad de ${opcion.label} al carrito`
                            }
                            onClick={() => agregarItem(opcion)}
                            className="group flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-zinc-900">
                                {opcion.label}
                              </span>
                              <span className="mt-1 block text-xs text-zinc-500">
                                {formatoMoneda(opcion.precio)}
                              </span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-xs font-medium text-zinc-600">
                                {sinStock ? 'Sin stock' : `${stockRestante} disponibles`}
                              </span>
                              {cantidadEnCarrito > 0 && (
                                <span className="mt-1 block text-[11px] font-medium text-indigo-700">
                                  {cantidadEnCarrito} en carrito
                                </span>
                              )}
                              {!sinStock && (
                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 group-hover:text-indigo-800">
                                  <LuPlus aria-hidden="true" size={12} />
                                  Agregar
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {selectoresError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p role="alert" className="text-sm text-red-700">{selectoresError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isLoadingSelectors}
                  onClick={() => void cargarSelectores()}
                >
                  {isLoadingSelectors ? 'Cargando…' : 'Reintentar carga'}
                </Button>
              </div>
            )}

            <Table
              columns={DETALLE_COLUMNAS}
              data={items.map((item) => ({
                ...item,
                onQuitar: () => quitarItem(item.productoId),
              }))}
              getRowKey={(row) => row.productoId}
              emptyMessage="Agregá productos para comenzar a armar la venta."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
              <FormField label="Medio de pago" htmlFor="nueva-venta-pago" required>
                <Select
                  id="nueva-venta-pago"
                  value={medioPago}
                  onChange={(event) => setMedioPago(event.target.value as MetodoPagoBackend)}
                  options={NUEVA_VENTA_MEDIO_PAGO_OPCIONES}
                />
              </FormField>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Productos</span>
                  <span className="tabular-nums">
                    {items.reduce((total, item) => total + item.cantidad, 0)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-950">
                  <span>Total estimado</span>
                  <span className="tabular-nums">{formatoMoneda(totalEstimado)}</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  El sistema calcula el total definitivo al confirmar.
                </p>
              </div>
            </div>

            {ventaError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {ventaError}
              </p>
            )}
        </form>
      </Modal>

      <Modal
        open={detalleId !== null}
        title={detalle ? `Venta #${detalle.id}` : 'Detalle de venta'}
        onClose={() => {
          if (!detalleLoading) {
            setDetalleId(null);
            setDetalle(null);
          }
        }}
      >
        {detalleLoading && <p className="text-sm text-zinc-500">Cargando detalle…</p>}
        {detalleError && (
          <p role="alert" className="text-sm text-red-600">
            {detalleError}
          </p>
        )}
        {detalle && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Cliente</dt>
                <dd className="font-medium text-zinc-900">
                  {detalle.cliente
                    ? `${detalle.cliente.nombre} ${detalle.cliente.apellido}`.trim()
                    : 'Consumidor final'}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Fecha</dt>
                <dd className="font-medium text-zinc-900">{formatoFecha(detalle.fecha)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Medio de pago</dt>
                <dd className="font-medium text-zinc-900">
                  {METODO_PAGO_ETIQUETA[detalle.metodoPago] ?? detalle.metodoPago}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Total</dt>
                <dd className="font-medium text-zinc-900">{formatoMoneda(detalle.total)}</dd>
              </div>
            </dl>
            <Table
              columns={DETALLE_VENTA_COLUMNAS}
              data={detalle.detalles ?? []}
              getRowKey={(row) => row.id}
              emptyMessage="Sin productos en esta venta."
            />
          </div>
        )}
      </Modal>

      <Modal
        open={anularTarget !== null}
        title="Anular venta"
        description={
          anularTarget
            ? `¿Anular la venta #${anularTarget.id}? Esta acción no se puede deshacer.`
            : undefined
        }
        onClose={() => {
          if (!isAnulando) setAnularTarget(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isAnulando}
              onClick={() => setAnularTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isAnulando}
              onClick={() => void confirmarAnulacion()}
            >
              {isAnulando ? 'Anulando…' : 'Anular venta'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <FormField label="Motivo" htmlFor="anular-venta-motivo" required>
            <Input
              id="anular-venta-motivo"
              value={motivoAnulacion}
              maxLength={500}
              placeholder="Indicá el motivo de la anulación"
              onChange={(event) => {
                setMotivoAnulacion(event.target.value);
                setAnularError(null);
              }}
            />
          </FormField>
          <p className="text-sm text-zinc-500">
            La venta quedará anulada y, si estaba completada, el stock de sus productos se
            repondrá automáticamente.
          </p>
          {anularError && (
            <p role="alert" className="text-sm text-red-600">
              {anularError}
            </p>
          )}
        </div>
      </Modal>

    </>
  );
}
