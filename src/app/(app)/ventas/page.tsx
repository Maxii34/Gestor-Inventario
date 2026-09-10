'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LuEye,
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
import { ApiError } from '@/lib/api/client';
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
  type VentaCreada,
} from '@/services/ventas.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;
const SELECTOR_PAGE_SIZE = 100;

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const MEDIO_PAGO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mercado-pago', label: 'Mercado Pago' },
];

const PERIODO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ultimos-7', label: 'Últimos 7 días' },
  { value: 'ultimos-30', label: 'Últimos 30 días' },
];

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
        {row.estado === 'PENDIENTE' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Cancelar la venta #${row.id}`}
            onClick={row.onAnular}
          >
            <LuX aria-hidden="true" size={14} />
            Cancelar
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
  const [isAnulando, setIsAnulando] = useState(false);
  const [anularError, setAnularError] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [clienteOpciones, setClienteOpciones] = useState<{ value: string; label: string }[]>([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productoOpciones, setProductoOpciones] = useState<ProductoOpcion[]>([]);
  const [selectoresError, setSelectoresError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemNuevaVenta[]>([]);
  const [medioPago, setMedioPago] = useState<MetodoPagoBackend>('EFECTIVO');
  const [ventaError, setVentaError] = useState<string | null>(null);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [ventaCreada, setVentaCreada] = useState<VentaCreada | null>(null);

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
    setSelectoresError(null);
    try {
      const [clientes, productos] = await Promise.all([
        listarClientes(1, SELECTOR_PAGE_SIZE),
        listarProductos(1, SELECTOR_PAGE_SIZE),
      ]);
      setClienteOpciones(
        clientes.clientes.map((cliente) => ({
          value: String(cliente.id),
          label: `${cliente.nombre} ${cliente.apellido}`.trim(),
        })),
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
          : 'No pudimos cargar clientes y productos.',
      );
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
    setAnularError(null);
    setIsAnulando(true);
    try {
      await anularVenta(anularTarget.id);
      setAnularTarget(null);
      await cargarPagina(page);
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

  function agregarItem(): void {
    setVentaError(null);
    const opcion = productoOpciones.find((item) => item.value === productoId);
    const cantidadNumero = Number(cantidad);
    if (!opcion) {
      setVentaError('Seleccioná un producto para agregarlo.');
      return;
    }
    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      setVentaError('La cantidad debe ser un número entero mayor a 0.');
      return;
    }
    const existente = items.find((item) => item.productoId === Number(productoId));
    const cantidadTotal = (existente?.cantidad ?? 0) + cantidadNumero;
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
          productoId: Number(productoId),
          nombre: opcion.label,
          precioUnitario: opcion.precio,
          cantidad: cantidadNumero,
          stock: opcion.stock,
        },
      ]);
    }
    setProductoId('');
    setCantidad('');
  }

  function quitarItem(productoIdQuitar: number): void {
    setItems(items.filter((item) => item.productoId !== productoIdQuitar));
  }

  function limpiarNuevaVenta(): void {
    setClienteId('');
    setProductoId('');
    setCantidad('');
    setItems([]);
    setMedioPago('EFECTIVO');
    setVentaError(null);
    setVentaCreada(null);
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
        ...(clienteId ? { clienteId: Number(clienteId) } : {}),
        metodoPago: medioPago,
        detalles: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      });
      setVentaCreada(creada);
      if (page === 1) {
        await cargarPagina(1);
      } else {
        setPage(1);
      }
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
      setAnularTarget(venta);
    },
  }));

  const totalEstimado = items.reduce(
    (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
    0,
  );

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Consulta las ventas registradas y genera nuevas operaciones."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() =>
              document.getElementById('nueva-venta')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <LuPlus aria-hidden="true" size={16} />
            Nueva venta
          </Button>
        }
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card title="Ventas registradas">
            <p className="text-2xl font-bold text-zinc-900">{meta.total}</p>
            <p className="mt-1 text-xs text-zinc-500">operaciones en el sistema</p>
          </Card>
        </div>

        <Card
          title="Filtros"
          subtitle="Controles visuales sin funcionalidad"
          actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              id="buscar-venta"
              label="Buscar"
              placeholder="Buscar por cliente o número de venta..."
              value=""
              onChange={() => undefined}
            />
            <Select label="Estado" defaultValue="todos" options={ESTADO_OPCIONES} />
            <Select
              label="Medio de pago"
              defaultValue="todos"
              options={MEDIO_PAGO_OPCIONES}
            />
            <Select label="Período" defaultValue="todos" options={PERIODO_OPCIONES} />
          </div>
        </Card>

        <Card title="Listado de ventas" subtitle={`${meta.total} ventas registradas`}>
          {isLoading ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando ventas…</span>
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
                columns={VENTA_COLUMNAS}
                data={filas}
                getRowKey={(row) => row.id}
                emptyMessage="Sin ventas para mostrar."
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

        <Card title="Nueva venta" subtitle="Operación conectada al backend">
          <div id="nueva-venta" className="flex flex-col gap-6">
            {ventaCreada ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-900">
                  Venta #{ventaCreada.ventaId} registrada correctamente.
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Usá el siguiente enlace para continuar con el pago en Mercado Pago.
                </p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                  <Button type="button" variant="outline" onClick={limpiarNuevaVenta}>
                    Registrar otra venta
                  </Button>
                  <a
                    href={ventaCreada.initPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    Continuar al pago
                  </a>
                </div>
              </div>
            ) : (
              <>
                <FormField label="Cliente" htmlFor="nueva-venta-cliente">
                  <Select
                    id="nueva-venta-cliente"
                    value={clienteId}
                    onChange={(event) => setClienteId(event.target.value)}
                    placeholder="Consumidor final"
                    options={clienteOpciones}
                  />
                </FormField>

                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-700">Productos de la venta</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_140px_auto] md:items-end">
                    <FormField label="Producto" htmlFor="nueva-venta-producto">
                      <Select
                        id="nueva-venta-producto"
                        value={productoId}
                        onChange={(event) => setProductoId(event.target.value)}
                        placeholder="Seleccionar producto"
                        options={productoOpciones.map((opcion) => ({
                          value: opcion.value,
                          label: opcion.label,
                        }))}
                      />
                    </FormField>
                    <FormField label="Cantidad" htmlFor="nueva-venta-cantidad">
                      <Input
                        id="nueva-venta-cantidad"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="1"
                        value={cantidad}
                        onChange={(event) => setCantidad(event.target.value)}
                      />
                    </FormField>
                    <Button type="button" variant="outline" onClick={agregarItem}>
                      <LuPlus aria-hidden="true" size={16} />
                      Agregar
                    </Button>
                  </div>
                </div>

                <Table
                  columns={DETALLE_COLUMNAS}
                  data={items.map((item) => ({
                    ...item,
                    onQuitar: () => quitarItem(item.productoId),
                  }))}
                  getRowKey={(row) => row.productoId}
                  emptyMessage="Sin productos en la venta."
                />

                <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>{formatoMoneda(totalEstimado)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Descuento</span>
                    <span>{formatoMoneda(0)}</span>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                    <span>Total estimado</span>
                    <span>{formatoMoneda(totalEstimado)}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Estimación visual. El total definitivo lo calcula el backend.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="Medio de pago" htmlFor="nueva-venta-pago">
                    <Select
                      id="nueva-venta-pago"
                      value={medioPago}
                      onChange={(event) => setMedioPago(event.target.value as MetodoPagoBackend)}
                      options={NUEVA_VENTA_MEDIO_PAGO_OPCIONES}
                    />
                  </FormField>
                  <p className="self-end text-xs text-zinc-500">
                    Al registrar la venta, el backend genera el enlace de pago de Mercado
                    Pago.
                  </p>
                </div>

                {selectoresError && (
                  <p className="text-xs text-red-600">{selectoresError}</p>
                )}
                {ventaError && (
                  <p role="alert" className="text-sm text-red-600">
                    {ventaError}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={limpiarNuevaVenta}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void registrarVenta()}
                    disabled={isRegistrando}
                  >
                    <LuSave aria-hidden="true" size={16} />
                    {isRegistrando ? 'Registrando…' : 'Registrar venta'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

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
        {anularError ? (
          <p role="alert" className="text-sm text-red-600">
            {anularError}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Solo las ventas pendientes pueden anularse desde esta pantalla.
          </p>
        )}
      </Modal>
    </>
  );
}
