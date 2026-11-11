'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuCircleCheck,
  LuMinus,
  LuPlus,
  LuShoppingCart,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
} from '@/components/ui';
import { FormField, SearchInput } from '@/components/forms';
import { useAuth } from '@/context/AuthContext';
import { useSuscripcion } from '@/context/SuscripcionContext';
import { ApiError } from '@/lib/api/client';
import { MODULO_CLIENTES } from '@/lib/config';
import { notifySuccess } from '@/lib/notifications/toast';
import { listarClientes } from '@/services/clientes.service';
import {
  listarProductos,
  obtenerProductoPorCodigoBarras,
} from '@/services/productos.service';
import { crearVenta, type MetodoPagoBackend } from '@/services/ventas.service';

const SELECTOR_PAGE_SIZE = 100;

const NUEVA_VENTA_MEDIO_PAGO_OPCIONES = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
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

interface VentaRegistrada {
  id: number;
  total: number;
}

function toNumber(valor: number | string): number {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  return Number.isFinite(numero) ? numero : 0;
}

function formatoMoneda(valor: number | string): string {
  return `$${toNumber(valor).toLocaleString('es-AR')}`;
}

export function NuevaVentaForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  const isAdmin = user?.rol === 'ADMIN';

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
  const [ultimaVenta, setUltimaVenta] = useState<VentaRegistrada | null>(null);

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
      await cargarSelectores();
    }
    void cargarInicial();
  }, [cargarSelectores]);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const frame = requestAnimationFrame(() => {
      const input = document.getElementById('venta-escaner');
      if (input instanceof HTMLInputElement) input.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!feedbackEscaneo) return;
    const timeout = window.setTimeout(() => setFeedbackEscaneo(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedbackEscaneo]);

  function reemplazarItems(nuevosItems: ItemNuevaVenta[]): void {
    itemsRef.current = nuevosItems;
    setItems(nuevosItems);
  }

  function enfocarEscaner(): void {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    requestAnimationFrame(() => {
      const input = document.getElementById('venta-escaner');
      if (input instanceof HTMLInputElement) input.focus();
    });
  }

  function agregarItem(opcion: ProductoOpcion, porEscaneo = false): boolean {
    setVentaError(null);
    setUltimaVenta(null);
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
    setVentaError(null);
    setUltimaVenta(null);
    reemplazarItems(itemsRef.current.filter((item) => item.productoId !== productoIdQuitar));
    enfocarEscaner();
  }

  function cambiarCantidad(productoId: number, delta: number): void {
    setVentaError(null);
    setUltimaVenta(null);
    const item = itemsRef.current.find((actual) => actual.productoId === productoId);
    if (!item) return;
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;
    if (nuevaCantidad > item.stock) {
      setVentaError(`Stock disponible de "${item.nombre}": ${item.stock}.`);
      return;
    }
    reemplazarItems(
      itemsRef.current.map((actual) =>
        actual.productoId === productoId ? { ...actual, cantidad: nuevaCantidad } : actual,
      ),
    );
  }

  function reiniciarCamposVenta(): void {
    scanSessionRef.current += 1;
    setClienteId('');
    setBusquedaProducto('');
    reemplazarItems([]);
    setMedioPago('EFECTIVO');
    setVentaError(null);
    setCodigoEscaneo('');
    setFeedbackEscaneo(null);
    enfocarEscaner();
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

  async function registrarVenta(): Promise<void> {
    if (isRegistrando) return;
    if (itemsRef.current.length === 0) {
      setVentaError('Agregá al menos un producto a la venta.');
      return;
    }
    setVentaError(null);
    setUltimaVenta(null);
    setIsRegistrando(true);
    try {
      const creada = await crearVenta({
        ...(MODULO_CLIENTES && clienteId ? { clienteId: Number(clienteId) } : {}),
        metodoPago: medioPago,
        detalles: itemsRef.current.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      });
      const totalVenta = itemsRef.current.reduce(
        (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
        0,
      );
      notifySuccess('Venta registrada', `La venta #${creada.ventaId} quedó confirmada.`);
      setUltimaVenta({ id: creada.ventaId, total: totalVenta });
      reiniciarCamposVenta();
      await cargarSelectores();
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

  const totalEstimado = items.reduce(
    (acumulado, item) => acumulado + item.precioUnitario * item.cantidad,
    0,
  );
  const totalUnidades = items.reduce((total, item) => total + item.cantidad, 0);
  const textoBusquedaProducto = busquedaProducto.trim().toLocaleLowerCase('es-AR');
  const productosFiltrados = textoBusquedaProducto
    ? productoOpciones.filter((producto) =>
        producto.label.toLocaleLowerCase('es-AR').includes(textoBusquedaProducto),
      )
    : productoOpciones;
  const puedeConfirmar =
    !isRegistrando && !isLoadingSelectors && !selectoresError && !soloLectura;

  return (
    <form
      id="nueva-venta-formulario"
      onSubmit={(event) => {
        event.preventDefault();
        void registrarVenta();
      }}
      className="pb-28 lg:pb-0"
    >
      {ultimaVenta && (
        <div
          role="status"
          className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <LuCircleCheck aria-hidden="true" size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Venta #{ultimaVenta.id} registrada correctamente
              </p>
              <p className="mt-0.5 text-xs text-emerald-800">
                Total: {formatoMoneda(ultimaVenta.total)}. El stock ya fue actualizado.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push('/ventas')}>
              Ver historial
            </Button>
            <button
              type="button"
              aria-label="Ocultar confirmación"
              onClick={() => setUltimaVenta(null)}
              className="rounded-lg p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <LuX aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.9fr)] lg:items-stretch">
        <Card
          title="Productos"
          subtitle="Buscá por nombre o escaneá el código de barras."
          className="h-full border-zinc-200/80 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            <FormField label="Escáner de código de barras" htmlFor="venta-escaner">
              <Input
                id="venta-escaner"
                placeholder="Escaneá un producto o escribí el código"
                autoComplete="off"
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

            {selectoresError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <p role="alert" className="text-sm text-red-700">
                  {selectoresError}
                </p>
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
            ) : isLoadingSelectors ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-zinc-100" />
                ))}
                <span className="sr-only">Cargando productos…</span>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
                No encontramos productos con ese nombre.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    {textoBusquedaProducto
                      ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'resultado' : 'resultados'}`
                      : `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'producto disponible' : 'productos disponibles'}`}
                  </p>
                  <span className="text-[11px] text-zinc-400">Tocá un producto para agregarlo</span>
                </div>
                <ul
                  aria-label="Productos disponibles para agregar a la venta"
                  className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 xl:grid-cols-2"
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
                          className="group flex w-full flex-col gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60"
                        >
                          <span className="block w-full truncate text-sm font-medium leading-5 text-zinc-900">
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
              </>
            )}
          </div>
        </Card>

        <div className="h-full lg:sticky lg:top-20">
          <Card
            title="Resumen de la venta"
            subtitle="Revisá los productos y confirmá la operación."
            actions={
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-indigo-700 ring-1 ring-indigo-100">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            }
            className="h-full border-zinc-200/80 shadow-sm"
          >
            <div className="flex flex-col gap-4">
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

              {items.length === 0 ? (
                <EmptyState
                  title="Todavía no agregaste productos"
                  description="Buscá un producto o escaneá su código de barras para comenzar la venta."
                />
              ) : (
                <ul
                  aria-label="Productos agregados a la venta"
                  className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1"
                >
                  {items.map((item) => (
                    <li
                      key={item.productoId}
                      className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {item.nombre}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {formatoMoneda(item.precioUnitario)} c/u · Stock {item.stock}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                          {formatoMoneda(item.precioUnitario * item.cantidad)}
                        </p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white">
                          <button
                            type="button"
                            aria-label={`Quitar una unidad de ${item.nombre}`}
                            disabled={item.cantidad <= 1 || isRegistrando}
                            onClick={() => cambiarCantidad(item.productoId, -1)}
                            className="rounded-l-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <LuMinus aria-hidden="true" size={14} />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-zinc-900">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            aria-label={`Agregar una unidad de ${item.nombre}`}
                            disabled={item.cantidad >= item.stock || isRegistrando}
                            onClick={() => cambiarCantidad(item.productoId, 1)}
                            className="rounded-r-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <LuPlus aria-hidden="true" size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => quitarItem(item.productoId)}
                          disabled={isRegistrando}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <LuTrash2 aria-hidden="true" size={13} />
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <FormField label="Medio de pago" htmlFor="nueva-venta-pago" required>
                <Select
                  id="nueva-venta-pago"
                  value={medioPago}
                  onChange={(event) => setMedioPago(event.target.value as MetodoPagoBackend)}
                  options={NUEVA_VENTA_MEDIO_PAGO_OPCIONES}
                />
              </FormField>

              <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/70 via-white to-white p-4 shadow-sm">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Unidades</span>
                  <span className="tabular-nums">{totalUnidades}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-sm text-zinc-600">
                  <span>Productos</span>
                  <span className="tabular-nums">{items.length}</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between border-t border-indigo-100 pt-3">
                  <span className="text-sm font-medium text-zinc-700">Total</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-950 tabular-nums">
                    {formatoMoneda(totalEstimado)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  El sistema calcula el total definitivo al confirmar.
                </p>
              </div>

              {ventaError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {ventaError}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  fullWidth
                  disabled={!puedeConfirmar}
                  title={soloLectura ? motivoSoloLectura : undefined}
                >
                  <LuShoppingCart aria-hidden="true" size={16} />
                  {isRegistrando ? 'Registrando…' : 'Confirmar venta'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  disabled={isRegistrando || (items.length === 0 && !busquedaProducto && !codigoEscaneo)}
                  onClick={reiniciarCamposVenta}
                >
                  Limpiar venta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Total</p>
            <p className="truncate text-xl font-bold tabular-nums text-zinc-950">
              {formatoMoneda(totalEstimado)}
            </p>
            <p className="text-[11px] text-zinc-500">
              {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'} · {items.length}{' '}
              {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <Button
            type="submit"
            disabled={!puedeConfirmar}
            title={soloLectura ? motivoSoloLectura : undefined}
            className="shrink-0"
          >
            {isRegistrando ? 'Registrando…' : 'Confirmar venta'}
          </Button>
        </div>
      </div>
    </form>
  );
}
