'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  LuEllipsis,
  LuEye,
  LuCalendarClock,
  LuCreditCard,
  LuPackage,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuSearch,
  LuTags,
  LuUsers,
} from 'react-icons/lu';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  type TableColumn,
} from '@/components';
import { Pagination } from '@/components/tables';
import { ApiError } from '@/lib/api/client';
import { confirmAction, notifySuccess } from '@/lib/notifications/toast';
import {
  cambiarPlanComercio,
  crearComercio,
  extenderComercio,
  listarComercios,
  listarPagos,
  obtenerComercio,
  reactivarComercio,
  registrarPago,
  suspenderComercio,
  type CrearComercioInput,
  type EstadoComercio,
  type MetodoPago,
  type PlanComercio,
  type PlataformaComercio,
  type PlataformaPago,
  type RegistrarPagoInput,
} from '@/services/plataforma.service';
import type { PageMeta } from '@/types/api';

const PAGE_SIZE = 10;

const ESTADOS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'EN_GRACIA', label: 'En período de gracia' },
  { value: 'VENCIDA', label: 'Vencida' },
  { value: 'SUSPENDIDO', label: 'Suspendida' },
  { value: 'SIN_VENCIMIENTO', label: 'Sin vencimiento' },
];

const PLANES: { value: PlanComercio; label: string }[] = [
  { value: 'PRUEBA', label: 'Prueba' },
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
];

const FORMULARIO_INICIAL: CrearComercioInput = {
  nombre: '',
  slug: '',
  adminNombre: '',
  adminEmail: '',
  adminPassword: '',
  dias: 14,
};

const FORMULARIO_PAGO_INICIAL: RegistrarPagoInput = {
  plan: 'MENSUAL',
  meses: 1,
  monto: 0,
  metodo: 'TRANSFERENCIA',
  referencia: '',
  nota: '',
};

type AccionComercio = 'suspender' | 'extender' | 'plan' | 'pago';

interface EditarComercioForm {
  nombre: string;
  slug: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
}

function mostrarFecha(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(date);
}

function mostrarMoneda(value?: number | string): string {
  if (value === undefined || value === null || value === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(amount)
    : String(value);
}

function estadoVisual(estado?: string): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
} {
  switch (estado) {
    case 'VIGENTE':
      return { label: 'Vigente', tone: 'success' };
    case 'EN_GRACIA':
      return { label: 'En gracia', tone: 'warning' };
    case 'VENCIDA':
      return { label: 'Vencida', tone: 'danger' };
    case 'SUSPENDIDO':
      return { label: 'Suspendida', tone: 'danger' };
    case 'SIN_VENCIMIENTO':
      return { label: 'Sin vencimiento', tone: 'info' };
    default:
      return { label: estado ?? 'Sin estado', tone: 'neutral' };
  }
}

function estadoComercio(comercio?: PlataformaComercio | null): string | undefined {
  return comercio?.estadoSuscripcion ?? comercio?.estado;
}

export default function PlataformaDashboardPage() {
  const [comercios, setComercios] = useState<PlataformaComercio[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editingCommerce, setEditingCommerce] = useState<PlataformaComercio | null>(null);
  const [editForm, setEditForm] = useState<EditarComercioForm>({
    nombre: '',
    slug: '',
    adminNombre: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CrearComercioInput>(FORMULARIO_INICIAL);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [selected, setSelected] = useState<PlataformaComercio | null>(null);
  const [detail, setDetail] = useState<PlataformaComercio | null>(null);
  const [payments, setPayments] = useState<PlataformaPago[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [action, setAction] = useState<AccionComercio | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [extendDays, setExtendDays] = useState('10');
  const [selectedPlan, setSelectedPlan] = useState<PlanComercio>('MENSUAL');
  const [paymentForm, setPaymentForm] = useState<RegistrarPagoInput>(FORMULARIO_PAGO_INICIAL);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (new URLSearchParams(window.location.search).get('crear') === '1') {
        setIsCreateOpen(true);
      }
    });
  }, []);

  const loadComercios = useCallback(async () => {
    try {
      const result = await listarComercios({
        page,
        limit: PAGE_SIZE,
        q: appliedSearch || undefined,
        estado: estado || undefined,
      });
      setComercios(result.comercios);
      setMeta(result.meta);
      setListError(null);
    } catch (error) {
      setListError(error instanceof ApiError ? error.message : 'No se pudieron cargar los comercios.');
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, estado, page]);

  useEffect(() => {
    void Promise.resolve().then(loadComercios);
  }, [loadComercios]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    Promise.all([obtenerComercio(selected.id), listarPagos(selected.id)])
      .then(([commerce, paymentList]) => {
        if (!active) return;
        setDetail(commerce);
        setPayments(paymentList.pagos);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDetailError(
          error instanceof ApiError ? error.message : 'No se pudo cargar el detalle del comercio.',
        );
      })
      .finally(() => {
        if (active) setIsDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected]);

  async function refreshAll(): Promise<void> {
    setIsRefreshing(true);
    setIsLoading(true);
    await loadComercios();
    setIsRefreshing(false);
  }

  function applySearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setAppliedSearch(search.trim());
  }

  function changePage(nextPage: number): void {
    setIsLoading(true);
    setPage(nextPage);
  }

  function openEditCommerce(commerce: PlataformaComercio): void {
    const admin = commerce.administrador ?? commerce.admin;
    const adminUsuario = commerce.usuarios?.find((usuario) => usuario.rol === 'ADMIN');
    setEditForm({
      nombre: commerce.nombre,
      slug: commerce.slug ?? '',
      adminNombre: commerce.adminNombre ?? admin?.nombre ?? adminUsuario?.nombre ?? '',
      adminEmail: commerce.adminEmail ?? admin?.email ?? adminUsuario?.email ?? commerce.email ?? '',
      adminPassword: '',
    });
    setEditingCommerce(commerce);
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isCreating) return;
    const passwordBytes = new TextEncoder().encode(createForm.adminPassword).length;
    if (passwordBytes < 6 || passwordBytes > 72) {
      setCreateError('La contraseña debe tener entre 6 y 72 bytes.');
      return;
    }
    if (createForm.dias !== undefined && (!Number.isInteger(createForm.dias) || createForm.dias < 1)) {
      setCreateError('Los días de prueba deben ser un entero positivo.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    try {
      const input = {
        ...createForm,
        nombre: createForm.nombre.trim(),
        adminNombre: createForm.adminNombre.trim(),
        adminEmail: createForm.adminEmail.trim(),
        ...(createForm.slug?.trim() ? { slug: createForm.slug.trim() } : { slug: undefined }),
      };
      await crearComercio(input);
      notifySuccess('Comercio registrado', `${input.nombre} ya está en la plataforma.`);
      setIsCreateOpen(false);
      setCreateForm(FORMULARIO_INICIAL);
      setIsLoading(true);
      setPage(1);
      await loadComercios();
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.message : 'No se pudo crear el comercio.');
    } finally {
      setIsCreating(false);
    }
  }

  function openAction(nextAction: AccionComercio): void {
    if (nextAction === 'pago') {
      setPaymentForm({ ...FORMULARIO_PAGO_INICIAL });
    }
    setAction(nextAction);
    setActionError(null);
  }

  function closeAction(): void {
    if (isActing) return;
    setAction(null);
    setActionError(null);
    setPaymentForm({ ...FORMULARIO_PAGO_INICIAL });
  }

  async function reloadSelected(): Promise<void> {
    if (!selected) return;
    const [commerce, paymentList] = await Promise.all([
      obtenerComercio(selected.id),
      listarPagos(selected.id),
    ]);
    setDetail(commerce);
    setPayments(paymentList.pagos);
  }

  async function submitAction(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selected || !action || isActing) return;
    setActionError(null);
    setIsActing(true);
    try {
      const nombreComercio = selected.nombre;
      if (action === 'suspender') {
        if (!suspendReason.trim()) {
          setActionError('Indicá un motivo para suspender el comercio.');
          return;
        }
        await suspenderComercio(selected.id, suspendReason.trim());
      } else if (action === 'extender') {
        const days = Number(extendDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) {
          setActionError('Los días deben ser un entero entre 1 y 365.');
          return;
        }
        await extenderComercio(selected.id, days);
      } else if (action === 'plan') {
        await cambiarPlanComercio(selected.id, selectedPlan);
      } else {
        const amount = Number(paymentForm.monto);
        if (!Number.isFinite(amount) || amount <= 0) {
          setActionError('El monto debe ser mayor que 0.');
          return;
        }
        if (!Number.isInteger(paymentForm.meses) || paymentForm.meses < 1 || paymentForm.meses > 24) {
          setActionError('Los meses deben ser un entero entre 1 y 24.');
          return;
        }
        await registrarPago(selected.id, {
          ...paymentForm,
          monto: amount,
          referencia: paymentForm.referencia?.trim() || undefined,
          nota: paymentForm.nota?.trim() || undefined,
        });
      }

      if (action === 'suspender') {
        notifySuccess('Comercio suspendido', `${nombreComercio} ya no tiene acceso activo.`);
      } else if (action === 'extender') {
        notifySuccess('Acceso extendido', `Se extendió el acceso de ${nombreComercio}.`);
      } else if (action === 'plan') {
        notifySuccess('Plan actualizado', `${nombreComercio} ahora tiene el plan ${selectedPlan}.`);
      } else {
        notifySuccess('Pago registrado', `El pago de ${nombreComercio} quedó asentado.`);
      }
      setAction(null);
      setSuspendReason('');
      if (action === 'pago') {
        setPaymentForm({ ...FORMULARIO_PAGO_INICIAL });
      }
      setIsLoading(true);
      await Promise.all([loadComercios(), reloadSelected()]);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'No se pudo completar la operación.');
    } finally {
      setIsActing(false);
    }
  }

  async function reactivateSelected(): Promise<void> {
    if (!selected || isActing) return;
    const confirmed = await confirmAction(
      '¿Reactivar comercio?',
      `Se restablecerá el acceso de ${selected.nombre}.`,
      'Sí, reactivar acceso',
    );
    if (!confirmed) return;
    setIsActing(true);
    setDetailError(null);
    try {
      await reactivarComercio(selected.id);
      notifySuccess('Comercio reactivado', `${selected.nombre} volvió a tener acceso.`);
      await Promise.all([loadComercios(), reloadSelected()]);
    } catch (error) {
      setDetailError(error instanceof ApiError ? error.message : 'No se pudo reactivar el comercio.');
    } finally {
      setIsActing(false);
    }
  }

  const columns: TableColumn<PlataformaComercio>[] = [
    {
      key: 'nombre',
      header: 'Comercio',
      render: (commerce) => (
        <div className="min-w-48">
          <p className="font-medium text-zinc-900">{commerce.nombre}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{commerce.slug || `ID ${commerce.id}`}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (commerce) => (
        <span className="font-medium text-zinc-700">{commerce.plan || '—'}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (commerce) => {
        const visual = estadoVisual(estadoComercio(commerce));
        return <Badge tone={visual.tone}>{visual.label}</Badge>;
      },
    },
    {
      key: 'vencimiento',
      header: 'Vencimiento',
      render: (commerce) => (
        <span className="whitespace-nowrap text-zinc-600">
          {estadoComercio(commerce) === 'SIN_VENCIMIENTO'
            ? 'Sin vencimiento'
            : mostrarFecha(commerce.accesoHasta ?? commerce.fechaVencimiento ?? commerce.venceEn)}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      align: 'right',
      render: (commerce) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Ver ${commerce.nombre}`}
            onClick={() => {
              setDetail(null);
              setPayments([]);
              setIsDetailLoading(true);
              setDetailError(null);
              setSelected(commerce);
            }}
          >
            <LuEye aria-hidden="true" size={16} />
            Ver
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Editar ${commerce.nombre}`}
            onClick={() => openEditCommerce(commerce)}
          >
            <LuPencil aria-hidden="true" size={15} />
            Editar
          </Button>
        </div>
      ),
    },
  ];

  const detailStatus = estadoVisual(estadoComercio(detail) ?? estadoComercio(selected));
  const planOptions = PLANES.filter((plan) => plan.value !== 'PRUEBA');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Comercios"
        description="Gestioná altas, accesos, planes y pagos de tus comercios."
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => void refreshAll()} disabled={isRefreshing}>
              <LuRefreshCw aria-hidden="true" size={15} className={isRefreshing ? 'animate-spin' : ''} />
              Actualizar
            </Button>
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <LuPlus aria-hidden="true" size={16} />
              Registrar comercio
            </Button>
          </>
        }
      />

      <section id="comercios" className="scroll-mt-24">
        <Card
          title="Comercios"
          subtitle={`${meta.total} ${meta.total === 1 ? 'comercio registrado' : 'comercios registrados'}`}
          actions={
            <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
              <LuEllipsis aria-hidden="true" size={16} />
              Acceso y suscripciones
            </span>
          }
          className="border-zinc-200/80 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <form onSubmit={applySearch} className="flex flex-1 flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Buscar comercios</span>
                <LuSearch aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, slug o administrador…"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-900"
                />
              </label>
              <Button type="submit" variant="secondary">Buscar</Button>
            </form>
            <div className="w-full sm:w-56">
              <Select
                aria-label="Filtrar por estado"
                options={ESTADOS}
                value={estado}
                onChange={(event) => {
                  setIsLoading(true);
                  setPage(1);
                  setEstado(event.target.value as EstadoComercio | '');
                }}
              />
            </div>
          </div>

          {listError ? (
            <EmptyState
              title="No se pudieron cargar los comercios"
              description={listError}
              action={<Button type="button" variant="outline" onClick={() => {
                setIsLoading(true);
                void loadComercios();
              }}>Reintentar</Button>}
            />
          ) : isLoading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-zinc-500">
              Cargando comercios…
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={comercios}
                getRowKey={(commerce) => commerce.id}
                emptyMessage="No encontramos comercios con esos filtros."
              />
              <div className="mt-4 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
                <p className="text-xs text-zinc-500">
                  Página {meta.page || page} de {meta.totalPaginas || 1}
                </p>
                <Pagination
                  page={page}
                  totalPages={meta.totalPaginas || 1}
                  disabled={isLoading}
                  onPageChange={changePage}
                />
              </div>
            </>
          )}
        </Card>
      </section>

      <Modal
        open={editingCommerce !== null}
        title="Editar datos del comercio"
        description={editingCommerce?.nombre}
        size="wide"
        onClose={() => setEditingCommerce(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditingCommerce(null)}>
              Cancelar
            </Button>
            <Button type="button" disabled title="El guardado estará disponible al conectar el endpoint de plataforma.">
              Guardar cambios
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-xs leading-5 text-indigo-900">
            Esta vista está preparada. El guardado se habilitará cuando esté disponible el endpoint de edición de plataforma.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre del local"
              required
              value={editForm.nombre}
              onChange={(event) => setEditForm({ ...editForm, nombre: event.target.value })}
              placeholder="Ej. Almacén Central"
            />
            <Input
              label="Identificador (slug)"
              value={editForm.slug}
              onChange={(event) => setEditForm({ ...editForm, slug: event.target.value })}
              placeholder="almacen-central"
            />
            <Input
              label="Nombre del administrador"
              required
              value={editForm.adminNombre}
              onChange={(event) => setEditForm({ ...editForm, adminNombre: event.target.value })}
              placeholder="Nombre y apellido"
            />
            <Input
              label="Correo del administrador"
              type="email"
              required
              value={editForm.adminEmail}
              onChange={(event) => setEditForm({ ...editForm, adminEmail: event.target.value })}
              placeholder="admin@comercio.com"
            />
            <Input
              label="Nueva contraseña"
              type="password"
              minLength={6}
              maxLength={72}
              value={editForm.adminPassword}
              onChange={(event) => setEditForm({ ...editForm, adminPassword: event.target.value })}
              hint="Opcional. Dejala vacía si no querés cambiarla."
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={isCreateOpen}
        title="Registrar comercio"
        description="Se creará el comercio y su cuenta de administrador."
        size="xl"
        onClose={() => {
          if (!isCreating) {
            setIsCreateOpen(false);
            setCreateError(null);
          }
        }}
        footer={
          <>
            <Button type="button" variant="outline" disabled={isCreating} onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="crear-comercio" disabled={isCreating}>
              {isCreating ? 'Creando…' : 'Crear comercio'}
            </Button>
          </>
        }
      >
        <form id="crear-comercio" onSubmit={(event) => void submitCreate(event)} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre del comercio"
            required
            value={createForm.nombre}
            onChange={(event) => setCreateForm({ ...createForm, nombre: event.target.value })}
            placeholder="Ej. Almacén Central"
          />
          <Input
            label="Slug (opcional)"
            value={createForm.slug}
            onChange={(event) => setCreateForm({ ...createForm, slug: event.target.value })}
            placeholder="almacen-central"
          />
          <Input
            label="Nombre del administrador"
            required
            value={createForm.adminNombre}
            onChange={(event) => setCreateForm({ ...createForm, adminNombre: event.target.value })}
            placeholder="Nombre y apellido"
          />
          <Input
            label="Email del administrador"
            type="email"
            required
            value={createForm.adminEmail}
            onChange={(event) => setCreateForm({ ...createForm, adminEmail: event.target.value })}
            placeholder="admin@comercio.com"
          />
          <Input
            label="Contraseña inicial"
            type="password"
            required
            minLength={6}
            maxLength={72}
            value={createForm.adminPassword}
            onChange={(event) => setCreateForm({ ...createForm, adminPassword: event.target.value })}
            hint="Entre 6 y 72 bytes."
          />
          <Input
            label="Días de prueba"
            type="number"
            min={1}
            step={1}
            value={createForm.dias}
            onChange={(event) =>
              setCreateForm({
                ...createForm,
                dias: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            hint="Opcional; por defecto se asignan 14 días."
          />
          {createError && (
            <p role="alert" className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {createError}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        open={selected !== null}
        title={detail?.nombre ?? selected?.nombre ?? 'Detalle del comercio'}
        description={detail?.slug ? `/${detail.slug}` : selected ? `Comercio #${selected.id}` : undefined}
        size="lg"
        onClose={() => {
          setSelected(null);
          setDetail(null);
          setDetailError(null);
        }}
      >
        {isDetailLoading ? (
          <div className="py-10 text-center text-sm text-zinc-500">Cargando detalle del comercio…</div>
        ) : (
          <div className="space-y-4">
            {detailError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {detailError}
              </p>
            )}
            {detail && (
              <>
                <section aria-label="Resumen del comercio" className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Estado</p>
                    <Badge className="mt-1.5" tone={detailStatus.tone}>{detailStatus.label}</Badge>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Plan actual</p>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-900">{detail.plan || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Usuarios</p>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                      {detail.conteos?.usuarios ?? detail._count?.usuarios ?? '—'} usuarios
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Vencimiento</p>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                      {estadoComercio(detail) === 'SIN_VENCIMIENTO'
                        ? 'Sin vencimiento'
                        : mostrarFecha(detail.accesoHasta ?? detail.fechaVencimiento ?? detail.venceEn)}
                    </p>
                  </div>
                </section>

                <section aria-labelledby="gestion-comercio-titulo">
                  <div className="mb-2">
                    <h3 id="gestion-comercio-titulo" className="text-sm font-semibold text-zinc-900">
                      Gestión del comercio
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Link
                      href={`/plataforma/comercios/${detail.id}/usuarios`}
                      className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                        <LuUsers aria-hidden="true" size={16} />
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-zinc-900">Usuarios</span>
                        <span className="block text-[11px] text-zinc-500">Roles y accesos</span>
                      </span>
                    </Link>
                    <Link
                      href={`/plataforma/comercios/${detail.id}/categorias`}
                      className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700">
                        <LuTags aria-hidden="true" size={16} />
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-zinc-900">Categorías</span>
                        <span className="block text-[11px] text-zinc-500">Carga masiva</span>
                      </span>
                    </Link>
                    <Link
                      href={`/plataforma/comercios/${detail.id}/productos`}
                      className="group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                        <LuPackage aria-hidden="true" size={16} />
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-zinc-900">Productos</span>
                        <span className="block text-[11px] text-zinc-500">Carga masiva</span>
                      </span>
                    </Link>
                  </div>
                </section>

                <section aria-labelledby="acciones-comercio-titulo" className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3">
                  <div className="mb-2">
                    <h3 id="acciones-comercio-titulo" className="text-sm font-semibold text-zinc-900">
                      Suscripción y pagos
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openAction('extender')}>
                      <LuCalendarClock aria-hidden="true" size={14} />
                      Extender
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => openAction('plan')}>
                      <LuRefreshCw aria-hidden="true" size={14} />
                      Cambiar plan
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => openAction('pago')}>
                      <LuCreditCard aria-hidden="true" size={14} />
                      Registrar pago
                    </Button>
                    {estadoComercio(detail) === 'SUSPENDIDO' ? (
                      <Button type="button" size="sm" onClick={() => void reactivateSelected()} disabled={isActing}>
                        {isActing ? 'Procesando…' : 'Reactivar acceso'}
                      </Button>
                    ) : (
                      <Button type="button" size="sm" variant="danger" onClick={() => openAction('suspender')}>
                        Suspender
                      </Button>
                    )}
                  </div>
                </section>

                <section aria-labelledby="pagos-recientes-titulo">
                  <div className="mb-3">
                    <h3 id="pagos-recientes-titulo" className="text-sm font-semibold text-zinc-900">
                      Pagos recientes
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">Últimos movimientos registrados para el comercio.</p>
                  </div>
                  {payments.length ? (
                    <div className="overflow-x-auto rounded-lg border border-zinc-200">
                      <table className="w-full min-w-130 text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Fecha</th>
                            <th className="px-3 py-2 font-semibold">Plan</th>
                            <th className="px-3 py-2 font-semibold">Método</th>
                            <th className="px-3 py-2 text-right font-semibold">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-3 py-2.5">{mostrarFecha(payment.fecha ?? payment.fechaCreacion ?? payment.createdAt)}</td>
                              <td className="px-3 py-2.5">{payment.plan || '—'}</td>
                              <td className="px-3 py-2.5">{payment.metodo || '—'}</td>
                              <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{mostrarMoneda(payment.monto)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-5 text-center text-xs text-zinc-500">
                      No hay pagos registrados.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={action !== null}
        title={
          action === 'suspender'
            ? 'Suspender comercio'
            : action === 'extender'
              ? 'Extender suscripción'
              : action === 'plan'
                ? 'Cambiar plan'
                : 'Registrar pago'
        }
        description={selected ? `Comercio: ${selected.nombre}` : undefined}
        onClose={() => {
          closeAction();
        }}
        footer={
          <>
            <Button type="button" variant="outline" disabled={isActing} onClick={closeAction}>
              Cancelar
            </Button>
            <Button type="submit" form="accion-comercio" variant={action === 'suspender' ? 'danger' : 'primary'} disabled={isActing}>
              {isActing ? 'Procesando…' : action === 'suspender' ? 'Suspender comercio' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <form id="accion-comercio" onSubmit={(event) => void submitAction(event)} className="space-y-4">
          {action === 'suspender' && (
            <Input
              label="Motivo de suspensión"
              required
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              placeholder="Describí el motivo"
            />
          )}
          {action === 'extender' && (
            <Input
              label="Días a extender"
              type="number"
              min={1}
              max={365}
              step={1}
              required
              value={extendDays}
              onChange={(event) => setExtendDays(event.target.value)}
              hint="Debe ser un entero entre 1 y 365."
            />
          )}
          {action === 'plan' && (
            <Select
              label="Nuevo plan"
              options={PLANES}
              value={selectedPlan}
              onChange={(event) => setSelectedPlan(event.target.value as PlanComercio)}
            />
          )}
          {action === 'pago' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Plan"
                options={planOptions}
                value={paymentForm.plan}
                onChange={(event) =>
                  setPaymentForm({ ...paymentForm, plan: event.target.value as 'MENSUAL' | 'TRIMESTRAL' })
                }
              />
              <Input
                label="Meses"
                type="number"
                min={1}
                max={24}
                step={1}
                required
                value={paymentForm.meses}
                onChange={(event) =>
                  setPaymentForm({ ...paymentForm, meses: event.target.value ? Number(event.target.value) : 0 })
                }
              />
              <Input
                label="Monto"
                type="number"
                min={0.01}
                step="0.01"
                required
                value={paymentForm.monto || ''}
                onChange={(event) =>
                  setPaymentForm({ ...paymentForm, monto: event.target.value ? Number(event.target.value) : 0 })
                }
              />
              <Select
                label="Método de pago"
                options={[
                  { value: 'TRANSFERENCIA', label: 'Transferencia' },
                  { value: 'EFECTIVO', label: 'Efectivo' },
                  { value: 'OTRO', label: 'Otro' },
                ]}
                value={paymentForm.metodo}
                onChange={(event) =>
                  setPaymentForm({ ...paymentForm, metodo: event.target.value as MetodoPago })
                }
              />
              <Input
                label="Referencia (opcional)"
                value={paymentForm.referencia}
                onChange={(event) => setPaymentForm({ ...paymentForm, referencia: event.target.value })}
              />
              <Input
                label="Nota (opcional)"
                value={paymentForm.nota}
                onChange={(event) => setPaymentForm({ ...paymentForm, nota: event.target.value })}
              />
            </div>
          )}
          {actionError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
