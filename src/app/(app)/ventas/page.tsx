'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuEye,
  LuMinus,
  LuPin,
  LuPinOff,
  LuPlus,
  LuReceipt,
  LuSave,
  LuSquare,
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
import { useSuscripcion } from '@/context/SuscripcionContext';
import {
  RecaudacionConsultaCard,
  RecaudacionTotalCard,
  useRecaudacion,
} from '@/components/estadisticas';
import { ApiError } from '@/lib/api/client';
import { MODULO_CLIENTES } from '@/lib/config';
import { notifySuccess } from '@/lib/notifications/toast';
import { listarClientes } from '@/services/clientes.service';
import {
  listarProductos,
  obtenerProductoPorCodigoBarras,
} from '@/services/productos.service';
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
const VENTA_MODAL_SIZE_KEY = 'gestor.ventas.modalSize';

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
  soloLectura: boolean;
  motivoSoloLectura: string;
}

const VENTA_COLUMNAS: TableColumn<FilaVenta>[] = [
  { key: 'id', header: 'Venta', render: (row) => `#${row.id}` },
  {
    key: 'unidades',
    header: '# Unidades',
    align: 'center',
    render: (row) => row.detalles?.reduce((total, detalle) => total + detalle.cantidad, 0) ?? '—',
  },
  { key: 'fecha', header: '# Fecha', render: (row) => formatoFecha(row.fecha) },
  {
    key: 'total',
    header: '# Total',
    align: 'right',
    render: (row) => formatoMoneda(row.total),
  },
  {
    key: 'metodoPago',
    header: '# Medio de pago',
    render: (row) => METODO_PAGO_ETIQUETA[row.metodoPago] ?? row.metodoPago,
  },
  {
    key: 'estado',
    header: '# Estado',
    render: (row) => {
      const visual = ESTADO_VISUAL[row.estado];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'acciones',
    header: '# Acciones',
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
            disabled={row.soloLectura}
            title={row.soloLectura ? row.motivoSoloLectura : undefined}
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

interface FeedbackEscaneo {
  mensaje: string;
  tono: 'success' | 'error';
  codigoNoRegistrado?: string;
}

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
  const router = useRouter();
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
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
  const itemsRef = useRef<ItemNuevaVenta[]>([]);
  const [medioPago, setMedioPago] = useState<MetodoPagoBackend>('EFECTIVO');
  const [ventaError, setVentaError] = useState<string | null>(null);
  const [codigoEscaneo, setCodigoEscaneo] = useState('');
  const [feedbackEscaneo, setFeedbackEscaneo] = useState<FeedbackEscaneo | null>(null);
  const scanQueueRef = useRef<Promise<void>>(Promise.resolve());
  const scanSessionRef = useRef(0);
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [isVentaOpen, setIsVentaOpen] = useState(false);
  const [ventaModalAncho, setVentaModalAncho] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(VENTA_MODAL_SIZE_KEY) === 'wide',
  );
  const [tamanoVentaFijado, setTamanoVentaFijado] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(VENTA_MODAL_SIZE_KEY) !== null,
  );

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
    if (!isVentaOpen || detalleId !== null || anularTarget !== null) return;
    const frame = requestAnimationFrame(() => {
      const input = document.getElementById('venta-escaner');
      if (input instanceof HTMLInputElement) input.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isVentaOpen, detalleId, anularTarget]);

  useEffect(() => {
    if (!feedbackEscaneo) return;
    const timeout = window.setTimeout(() => setFeedbackEscaneo(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedbackEscaneo]);

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

  function reemplazarItems(nuevosItems: ItemNuevaVenta[]): void {
    itemsRef.current = nuevosItems;
    setItems(nuevosItems);
  }

  function enfocarEscaner(): void {
    if (!isVentaOpen) return;
    requestAnimationFrame(() => {
      const input = document.getElementById('venta-escaner');
      if (input instanceof HTMLInputElement) input.focus();
    });
  }

  function agregarItem(opcion: ProductoOpcion, porEscaneo = false): boolean {
    setVentaError(null);
    const itemsActuales = itemsRef.current;
    const existente = itemsActuales.find((item) => item.productoId === Number(opcion.value));
    const cantidadTotal = (existente?.cantidad ?? 0) + 1;
    if (cantidadTotal > opcion.stock) {
      if (porEscaneo) {
        setFeedbackEscaneo({ mensaje: 'Stock insuficiente', tono: 'error' });
      } else {
        setVentaError(`Stock disponible de "${opcion.label}": ${opcion.stock}.`);
      }
      return false;
    }
    if (existente) {
      reemplazarItems(
        itemsActuales.map((item) =>
          item.productoId === existente.productoId
            ? {
                ...item,
                nombre: opcion.label,
                precioUnitario: opcion.precio,
                stock: opcion.stock,
                cantidad: cantidadTotal,
              }
            : item,
        ),
      );
    } else {
      reemplazarItems([
        ...itemsActuales,
        {
          productoId: Number(opcion.value),
          nombre: opcion.label,
          precioUnitario: opcion.precio,
          cantidad: 1,
          stock: opcion.stock,
        },
      ]);
    }
    if (porEscaneo) {
      setFeedbackEscaneo({ mensaje: `${opcion.label} agregado al carrito.`, tono: 'success' });
    }
    return true;
  }

  function quitarItem(productoIdQuitar: number): void {
    reemplazarItems(itemsRef.current.filter((item) => item.productoId !== productoIdQuitar));
    enfocarEscaner();
  }

  function reiniciarCamposVenta(): void {
    setClienteId('');
    setBusquedaProducto('');
    reemplazarItems([]);
    setMedioPago('EFECTIVO');
    setVentaError(null);
    setCodigoEscaneo('');
    setFeedbackEscaneo(null);
  }

  function limpiarNuevaVenta(): void {
    scanSessionRef.current += 1;
    reiniciarCamposVenta();
    setIsVentaOpen(false);
  }

  function abrirNuevaVenta(): void {
    scanSessionRef.current += 1;
    reiniciarCamposVenta();
    const tamanoGuardado = window.localStorage.getItem(VENTA_MODAL_SIZE_KEY);
    setVentaModalAncho(tamanoGuardado === 'wide');
    setTamanoVentaFijado(tamanoGuardado !== null);
    setIsVentaOpen(true);
  }

  async function procesarCodigoEscaneado(codigo: string, sesion: number): Promise<void> {
    try {
      const producto = await obtenerProductoPorCodigoBarras(codigo);
      if (scanSessionRef.current !== sesion) return;
      if (soloLectura) {
        setFeedbackEscaneo({
          mensaje: `${producto.nombre} encontrado. La venta está deshabilitada por la suscripción.`,
          tono: 'success',
        });
        return;
      }
      agregarItem(
        {
          value: String(producto.id),
          label: producto.nombre,
          precio: toNumber(producto.precioVenta),
          stock: producto.stock,
        },
        true,
      );
    } catch (err) {
      if (scanSessionRef.current !== sesion) return;
      if (err instanceof ApiError && err.status === 404) {
        setFeedbackEscaneo({
          mensaje: `Código no registrado: ${codigo}`,
          tono: 'error',
          ...(isAdmin ? { codigoNoRegistrado: codigo } : {}),
        });
      } else {
        setFeedbackEscaneo({
          mensaje:
            err instanceof ApiError
              ? err.message
              : 'No pudimos consultar el código de barras.',
          tono: 'error',
        });
      }
    } finally {
      if (scanSessionRef.current === sesion) enfocarEscaner();
    }
  }

  function encolarCodigoEscaneado(codigoSinRecortar: string): void {
    const codigo = codigoSinRecortar.trim();
    if (!codigo) return;
    const sesion = scanSessionRef.current;
    setFeedbackEscaneo(null);
    scanQueueRef.current = scanQueueRef.current
      .then(() => procesarCodigoEscaneado(codigo, sesion))
      .catch(() => {
        setFeedbackEscaneo({
          mensaje: 'No pudimos consultar el código de barras.',
          tono: 'error',
        });
      });
  }

  function crearProductoConCodigo(codigo: string): void {
    router.push(`/productos?codigoBarras=${encodeURIComponent(codigo)}`);
  }

  function cambiarTamanoVenta(ancho: boolean): void {
    setVentaModalAncho(ancho);
    if (tamanoVentaFijado) {
      window.localStorage.setItem(VENTA_MODAL_SIZE_KEY, ancho ? 'wide' : 'regular');
    }
  }

  function alternarTamanoFijado(): void {
    if (tamanoVentaFijado) {
      window.localStorage.removeItem(VENTA_MODAL_SIZE_KEY);
      setTamanoVentaFijado(false);
      return;
    }
    window.localStorage.setItem(VENTA_MODAL_SIZE_KEY, ventaModalAncho ? 'wide' : 'regular');
    setTamanoVentaFijado(true);
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
    soloLectura,
    motivoSoloLectura,
  }));

  const totalEstimado = items.reduce(
    (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
    0,
  );
  const textoBusquedaProducto = busquedaProducto.trim().toLocaleLowerCase('es-AR');
  const productosFiltrados = productoOpciones.filter((producto) =>
    producto.label.toLocaleLowerCase('es-AR').includes(textoBusquedaProducto),
  );

  const campoBusquedaProducto = (
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
  );

  const listaProductosDisponibles = !textoBusquedaProducto ? (
    <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
      Buscá un producto para ver las opciones disponibles.
    </p>
  ) : isLoadingSelectors ? (
    <p className="rounded-lg border border-zinc-200 bg-white px-3 py-4 text-center text-sm text-zinc-500">
      Cargando productos…
    </p>
  ) : !selectoresError && productosFiltrados.length === 0 ? (
    <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-4 text-center text-sm text-zinc-500">
      No encontramos productos con ese nombre.
    </p>
  ) : (
    <ul
      aria-label="Productos disponibles para agregar a la venta"
      className={`grid max-h-64 grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-80 ${
        ventaModalAncho ? 'xl:grid-cols-2' : 'sm:grid-cols-2'
      }`}
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
              disabled={sinStock || isRegistrando || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
              aria-label={
                sinStock
                  ? `${opcion.label}, sin unidades disponibles`
                  : `Agregar una unidad de ${opcion.label} al carrito`
              }
              onClick={() => {
                agregarItem(opcion);
                enfocarEscaner();
              }}
              className="group flex w-full flex-col gap-1 rounded-xl border border-zinc-200/90 bg-white px-2.5 py-1.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60"
            >
              <span className="block w-full truncate text-[13px] font-medium leading-4 text-zinc-900">
                  {opcion.label}
              </span>
              <span className="flex w-full min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-zinc-800 tabular-nums">
                  {formatoMoneda(opcion.precio)}
                </span>
                <span
                  className={`shrink-0 text-[10px] font-medium leading-4 tabular-nums ${
                    sinStock
                      ? 'rounded-full border border-zinc-200 bg-zinc-50 px-1.5 text-zinc-400'
                      : stockRestante <= 5
                        ? 'rounded-full border border-amber-200 bg-amber-50 px-1.5 text-amber-700'
                        : 'rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-emerald-700'
                  }`}
                >
                  {sinStock ? 'Sin stock' : `Stock ${stockRestante}`}
                </span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-100">
                  <LuPlus aria-hidden="true" size={15} />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
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
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuPlus aria-hidden="true" size={16} />
            Nueva venta
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section
          aria-label="Resumen de ventas"
          className="grid grid-cols-2 items-stretch gap-2 sm:gap-3"
        >
          <Reveal delay={0}>
            <Card className="h-full border-zinc-200/80 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium leading-tight text-zinc-600 sm:text-sm">Ventas registradas</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums sm:mt-2 sm:text-3xl">
                    {isLoading ? '—' : meta.total.toLocaleString('es-AR')}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Operaciones en todo el historial</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:h-11 sm:w-11">
                  <LuReceipt aria-hidden="true" size={18} />
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
                    compactOnMobile
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
        size={ventaModalAncho ? 'wide' : 'xl'}
        headerActions={
          <div className="mr-1 flex items-center gap-1">
            <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
              <button
                type="button"
                aria-label="Usar tamaño actual"
                aria-pressed={!ventaModalAncho}
                title="Tamaño actual"
                onClick={() => cambiarTamanoVenta(false)}
                className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                  !ventaModalAncho
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-zinc-200'
                    : 'text-zinc-500 hover:bg-white hover:text-zinc-800'
                }`}
              >
                <LuMinus aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                aria-label="Expandir ventana"
                aria-pressed={ventaModalAncho}
                title="Expandir ventana"
                onClick={() => cambiarTamanoVenta(true)}
                className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                  ventaModalAncho
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-zinc-200'
                    : 'text-zinc-500 hover:bg-white hover:text-zinc-800'
                }`}
              >
                <LuSquare aria-hidden="true" size={14} />
              </button>
            </div>
            <button
              type="button"
              aria-label={tamanoVentaFijado ? 'Desbloquear tamaño de ventana' : 'Fijar tamaño de ventana'}
              aria-pressed={tamanoVentaFijado}
              title={tamanoVentaFijado ? 'Tamaño fijado' : 'Fijar este tamaño'}
              onClick={alternarTamanoFijado}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                tamanoVentaFijado
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              {tamanoVentaFijado ? (
                <LuPin aria-hidden="true" size={15} />
              ) : (
                <LuPinOff aria-hidden="true" size={15} />
              )}
            </button>
          </div>
        }
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
              disabled={isRegistrando || isLoadingSelectors || !!selectoresError || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
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
          className={ventaModalAncho ? 'grid grid-cols-1 gap-4 lg:grid-cols-2' : 'flex flex-col gap-5'}
        >
          {MODULO_CLIENTES && (
              <FormField
                label="Cliente"
                htmlFor="nueva-venta-cliente"
                className={ventaModalAncho ? 'lg:col-span-2' : ''}
              >
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

          {ventaModalAncho && (
              <div className="lg:col-span-2">{campoBusquedaProducto}</div>
          )}

          <section
              aria-labelledby="nueva-venta-productos-titulo"
              className={`min-w-0 ${
                ventaModalAncho
                  ? `flex flex-col lg:col-start-1 ${
                      MODULO_CLIENTES ? 'lg:row-start-3' : 'lg:row-start-2'
                    }`
                  : ''
              }`}
          >
              <div className="mb-3">
                <h3 id="nueva-venta-productos-titulo" className="text-sm font-semibold text-zinc-900">
                  Productos disponibles
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Elegí un producto para agregarlo a la venta.
                </p>
              </div>
              {!ventaModalAncho && <div className="mb-3">{campoBusquedaProducto}</div>}
              {listaProductosDisponibles}
              {selectoresError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
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
          </section>

          <section
              aria-labelledby="carrito-venta-titulo"
              className={`flex min-w-0 flex-col gap-3 ${
                ventaModalAncho
                  ? `rounded-2xl border border-zinc-200 bg-linear-to-b from-zinc-50 to-white p-4 shadow-sm ring-1 ring-zinc-950/3 lg:col-start-2 ${
                      MODULO_CLIENTES ? 'lg:row-start-3' : 'lg:row-start-2'
                    }`
                  : ''
              }`}
          >
              <FormField label="Escáner de código de barras" htmlFor="venta-escaner">
                <Input
                  id="venta-escaner"
                  placeholder="Escaneá un producto o escribí el código"
                  autoComplete="off"
                  autoFocus
                  disabled={isRegistrando}
                  value={codigoEscaneo}
                  onChange={(event) => setCodigoEscaneo(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    event.stopPropagation();
                    const codigo = event.currentTarget.value;
                    setCodigoEscaneo('');
                    encolarCodigoEscaneado(codigo);
                    enfocarEscaner();
                  }}
                />
              </FormField>
              {feedbackEscaneo && (
                <div
                  role={feedbackEscaneo.tono === 'error' ? 'alert' : 'status'}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    feedbackEscaneo.tono === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  <p>{feedbackEscaneo.mensaje}</p>
                  {feedbackEscaneo.codigoNoRegistrado && (
                    <button
                      type="button"
                      onClick={() => {
                        const codigo = feedbackEscaneo.codigoNoRegistrado;
                        if (codigo) crearProductoConCodigo(codigo);
                      }}
                      className="mt-1 font-semibold underline underline-offset-2"
                    >
                      Crear producto con este código
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 id="carrito-venta-titulo" className="text-sm font-semibold text-zinc-900">
                      Carrito de venta
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">Productos y cantidades</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-indigo-700 ring-1 ring-indigo-100">
                    {items.length} {items.length === 1 ? 'producto' : 'productos'}
                  </span>
              </div>

              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-5 text-center text-xs text-zinc-500">
                  El carrito está vacío. Agregá productos desde el listado.
                </p>
              ) : (
                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.productoId}
                      className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-zinc-300"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium leading-4 text-zinc-900">
                          {item.nombre}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
                          {formatoMoneda(item.precioUnitario)} × {item.cantidad}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold tabular-nums text-zinc-800">
                        {formatoMoneda(item.precioUnitario * item.cantidad)}
                      </p>
                      <button
                        type="button"
                        aria-label={`Quitar ${item.nombre}`}
                        onClick={() => quitarItem(item.productoId)}
                        className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <LuX aria-hidden="true" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={ventaModalAncho ? 'flex flex-col gap-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]'}>
                <FormField label="Medio de pago" htmlFor="nueva-venta-pago" required>
                  <Select
                    id="nueva-venta-pago"
                    value={medioPago}
                    onChange={(event) => setMedioPago(event.target.value as MetodoPagoBackend)}
                    options={NUEVA_VENTA_MEDIO_PAGO_OPCIONES}
                  />
                </FormField>
                <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/70 via-white to-white p-3.5 shadow-sm">
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Productos</span>
                    <span className="tabular-nums">
                      {items.reduce((total, item) => total + item.cantidad, 0)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-indigo-100 pt-2 text-base font-semibold text-zinc-950">
                    <span>Total estimado</span>
                    <span className="tabular-nums">{formatoMoneda(totalEstimado)}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    El sistema calcula el total definitivo al confirmar.
                  </p>
                </div>
              </div>
          </section>

          {ventaError && (
              <p role="alert" className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${ventaModalAncho ? 'lg:col-span-2' : ''}`}>
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
              disabled={isAnulando || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
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
