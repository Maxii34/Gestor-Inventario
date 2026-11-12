'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuBanknote, LuEye, LuFilter, LuReceipt, LuX } from 'react-icons/lu';
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
import { notifySuccess } from '@/lib/notifications/toast';
import {
  anularVenta,
  listarVentas,
  obtenerVenta,
  type BackendVenta,
  type BackendVentaDetalle,
  type BackendVentaUsuario,
  type EstadoVentaBackend,
  type MetodoPagoBackend,
} from '@/services/ventas.service';
import { listarUsuarios } from '@/services/usuarios.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

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

const ROL_ETIQUETA: Record<BackendVentaUsuario['rol'], string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
};

const ESTADO_FILTRO_OPCIONES = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'COMPLETADA', label: 'Pagada' },
  { value: 'ANULADA', label: 'Cancelada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
];

const METODO_PAGO_FILTRO_OPCIONES = [
  { value: '', label: 'Todos' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
];

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
  return fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function esFechaISOValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

function etiquetaRol(rol: BackendVentaUsuario['rol']): string {
  return ROL_ETIQUETA[rol] ?? rol;
}

function UsuarioVenta({ usuario }: { usuario: BackendVentaUsuario | null | undefined }) {
  if (!usuario) return <span className="text-zinc-400">—</span>;
  return (
    <span className="flex flex-col">
      <span className="font-medium text-zinc-900">{usuario.nombre}</span>
      <span className="text-xs text-zinc-500">{etiquetaRol(usuario.rol)}</span>
    </span>
  );
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
    key: 'vendedor',
    header: '# Vendedor',
    render: (row) => <UsuarioVenta usuario={row.vendedor} />,
  },
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
          variant="action"
          size="sm"
          aria-label={`Ver detalle de la venta #${row.id}`}
          onClick={row.onVerDetalle}
        >
          <LuEye aria-hidden="true" size={14} />
          Ver
        </Button>
        {row.estado === 'COMPLETADA' && row.puedeAnular && (
          <Button
            type="button"
            variant="actionDanger"
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

  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('');
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const [vendedoresOpciones, setVendedoresOpciones] = useState<
    { value: string; label: string }[]
  >([]);

  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<BackendVenta | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  const [anularTarget, setAnularTarget] = useState<BackendVenta | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [isAnulando, setIsAnulando] = useState(false);
  const [anularError, setAnularError] = useState<string | null>(null);

  const recaudacion = useRecaudacion();

  const hayFiltros =
    filtroVendedor !== '' ||
    filtroDesde !== '' ||
    filtroHasta !== '' ||
    filtroEstado !== '' ||
    filtroMetodoPago !== '';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarVentas({
        page: pagina,
        limit: PAGE_SIZE,
        ...(isAdmin && filtroVendedor ? { vendedorId: Number(filtroVendedor) } : {}),
        ...(filtroDesde ? { desde: filtroDesde } : {}),
        ...(filtroHasta ? { hasta: filtroHasta } : {}),
        ...(filtroEstado ? { estado: filtroEstado as EstadoVentaBackend } : {}),
        ...(filtroMetodoPago
          ? { metodoPago: filtroMetodoPago as MetodoPagoBackend }
          : {}),
      });
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
  }, [
    isAdmin,
    filtroVendedor,
    filtroDesde,
    filtroHasta,
    filtroEstado,
    filtroMetodoPago,
  ]);

  useEffect(() => {
    if (!user || filtrosInicializados) return;

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;

      const parametros = new URLSearchParams(window.location.search);
      const vendedorParam = parametros.get('vendedorId') ?? '';
      const desdeParam = parametros.get('desde') ?? '';
      const hastaParam = parametros.get('hasta') ?? '';
      const estadoParam = parametros.get('estado') ?? '';
      const metodoPagoParam = parametros.get('metodoPago') ?? '';

      if (isAdmin && /^\d+$/.test(vendedorParam) && Number(vendedorParam) > 0) {
        setFiltroVendedor(vendedorParam);
      }
      if (esFechaISOValida(desdeParam)) setFiltroDesde(desdeParam);
      if (esFechaISOValida(hastaParam)) setFiltroHasta(hastaParam);
      if (ESTADO_FILTRO_OPCIONES.some((opcion) => opcion.value === estadoParam && opcion.value)) {
        setFiltroEstado(estadoParam);
      }
      if (
        METODO_PAGO_FILTRO_OPCIONES.some(
          (opcion) => opcion.value === metodoPagoParam && opcion.value,
        )
      ) {
        setFiltroMetodoPago(metodoPagoParam);
      }
      setFiltrosInicializados(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, filtrosInicializados]);

  useEffect(() => {
    if (!filtrosInicializados) return;
    async function cargarPaginaActual(): Promise<void> {
      await cargarPagina(page);
    }
    void cargarPaginaActual();
  }, [page, cargarPagina, filtrosInicializados]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    async function cargarVendedores(): Promise<void> {
      try {
        const usuarios = await listarUsuarios();
        if (!active) return;
        setVendedoresOpciones(
          usuarios.map((usuario) => ({
            value: String(usuario.id),
            label: usuario.nombre,
          })),
        );
      } catch {
        if (active) setVendedoresOpciones([]);
      }
    }
    void cargarVendedores();
    return () => {
      active = false;
    };
  }, [isAdmin]);

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

  function limpiarFiltros(): void {
    setFiltroVendedor('');
    setFiltroDesde('');
    setFiltroHasta('');
    setFiltroEstado('');
    setFiltroMetodoPago('');
    setPage(1);
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

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Consultá la recaudación y revisá el historial de ventas realizadas."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => router.push('/ventas/nueva')}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuBanknote aria-hidden="true" size={16} />
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
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium leading-tight text-zinc-600 sm:text-sm">Ventas registradas</p>
                    <HelpTooltip text="Cantidad total de ventas registradas en todo el historial." />
                  </div>
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

        <Reveal delay={0.12}>
          <Card
            title="Filtrar ventas"
            subtitle="Los filtros se aplican sobre el historial del servidor."
            actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
            className="border-zinc-200/80 shadow-sm"
          >
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-5">
              {isAdmin && (
                <Select
                  label="Vendedor"
                  value={filtroVendedor}
                  onChange={(event) => {
                    setFiltroVendedor(event.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: 'Todos' },
                    ...vendedoresOpciones,
                  ]}
                />
              )}
              <Input
                label="Desde"
                type="date"
                value={filtroDesde}
                max={filtroHasta || undefined}
                onChange={(event) => {
                  setFiltroDesde(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                label="Hasta"
                type="date"
                value={filtroHasta}
                min={filtroDesde || undefined}
                onChange={(event) => {
                  setFiltroHasta(event.target.value);
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
                options={ESTADO_FILTRO_OPCIONES}
              />
              <Select
                label="Método de pago"
                value={filtroMetodoPago}
                onChange={(event) => {
                  setFiltroMetodoPago(event.target.value);
                  setPage(1);
                }}
                options={METODO_PAGO_FILTRO_OPCIONES}
              />
            </div>
            {hayFiltros && (
              <div className="mt-4 flex justify-end border-t border-zinc-100 pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={limpiarFiltros}>
                  <LuX aria-hidden="true" size={14} />
                  Limpiar
                </Button>
              </div>
            )}
          </Card>
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
              <div className="col-span-2">
                <dt className="text-zinc-500">Vendedor</dt>
                <dd className="font-medium text-zinc-900">
                  <UsuarioVenta usuario={detalle.vendedor} />
                </dd>
              </div>
            </dl>
            {detalle.estado === 'ANULADA' && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
                <p className="font-semibold text-red-800">Anulada por</p>
                <div className="mt-1 text-red-900">
                  <UsuarioVenta usuario={detalle.anuladoPor} />
                </div>
                <p className="mt-2 text-red-800">
                  <span className="font-medium">Motivo:</span>{' '}
                  {detalle.motivoAnulacion?.trim() || '—'}
                </p>
                <p className="text-red-800">
                  <span className="font-medium">Fecha:</span>{' '}
                  {detalle.fechaAnulacion ? formatoFecha(detalle.fechaAnulacion) : '—'}
                </p>
              </div>
            )}
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
