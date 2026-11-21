'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuCircleCheck,
  LuCircleX,
  LuFilter,
  LuPencil,
  LuPlus,
  LuPower,
  LuPowerOff,
  LuSave,
  LuTrash2,
  LuUsers,
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
import IndicadorActualizacion from '@/components/IndicadorActualizacion';
import { useAuth } from '@/context/AuthContext';
import { useSuscripcion } from '@/context/SuscripcionContext';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { ApiError } from '@/lib/api/client';
import { mismoContenido } from '@/lib/comparar';
import { notifySuccess } from '@/lib/notifications/toast';
import type { PageMeta } from '@/types/api';
import {
  obtenerVentasPorVendedor,
  type VentaPorVendedorFila,
  type VentasPorVendedor,
} from '@/services/estadisticas.service';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  listarUsuariosPaginados,
  type BackendUsuario,
} from '@/services/usuarios.service';
import type { AuthRole } from '@/types/auth';

const PAGE_SIZE = 10;

const ROL_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
];

const ESTADO_OPCIONES = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const NUEVO_USUARIO_ROL_OPCIONES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
];

const ROL_VISUAL: Record<AuthRole, { etiqueta: string; tono: 'info' | 'neutral' }> = {
  ADMIN: { etiqueta: 'Administrador', tono: 'info' },
  VENDEDOR: { etiqueta: 'Vendedor', tono: 'neutral' },
};

interface FilaUsuario extends BackendUsuario {
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  puedeEliminar: boolean;
  soloLectura: boolean;
  motivoSoloLectura: string;
}

const USUARIO_COLUMNAS: TableColumn<FilaUsuario>[] = [
  {
    key: 'nombre',
    header: 'Empleado',
    render: (row) => (
      <div className="min-w-40">
        <p className="font-semibold text-zinc-900">{row.nombre}</p>
        <p className="mt-0.5 max-w-56 truncate text-xs text-zinc-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'rol',
    header: 'Permisos',
    render: (row) => {
      const visual = ROL_VISUAL[row.rol];
      return <Badge tone={visual.tono}>{visual.etiqueta}</Badge>;
    },
  },
  {
    key: 'fechaCreacion',
    header: 'Se unió',
    render: (row) => {
      const fecha = new Date(row.fechaCreacion);
      return (
        <span className="whitespace-nowrap text-xs text-zinc-600 tabular-nums">
          {Number.isNaN(fecha.getTime())
            ? '—'
            : new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(fecha)}
        </span>
      );
    },
  },
  {
    key: 'activo',
    header: 'Estado',
    render: (row) => (
      <Badge tone={row.activo ? 'success' : 'neutral'}>
        {row.activo ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'acciones',
    header: 'Acciones',
    align: 'right',
    render: (row) => (
      <span className="inline-flex gap-1">
        <Button
          type="button"
          variant="action"
          size="sm"
          aria-label={`Editar ${row.nombre}`}
          onClick={row.onEdit}
          disabled={row.soloLectura}
          title={row.soloLectura ? row.motivoSoloLectura : undefined}
        >
          <LuPencil aria-hidden="true" size={14} />
          Editar
        </Button>
        <Button
          type="button"
          variant="action"
          size="sm"
          aria-label={`${row.activo ? 'Desactivar' : 'Activar'} ${row.nombre}`}
          onClick={row.onToggleActive}
          disabled={row.soloLectura}
          title={row.soloLectura ? row.motivoSoloLectura : undefined}
        >
          {row.activo ? (
            <>
              <LuPowerOff aria-hidden="true" size={14} />
              Desactivar
            </>
          ) : (
            <>
              <LuPower aria-hidden="true" size={14} />
              Activar
            </>
          )}
        </Button>
        {row.puedeEliminar && (
          <Button
            type="button"
            variant="actionDanger"
            size="sm"
            aria-label={`Eliminar ${row.nombre}`}
            onClick={row.onDelete}
            disabled={row.soloLectura}
            title={row.soloLectura ? row.motivoSoloLectura : undefined}
          >
            <LuTrash2 aria-hidden="true" size={14} />
            Eliminar
          </Button>
        )}
      </span>
    ),
  },
];

function formatCurrency(value: number | string): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function fechaLocalISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function rangoHoy(): { desde: string; hasta: string } {
  const hoy = fechaLocalISO(new Date());
  return { desde: hoy, hasta: hoy };
}

function rangoSemanaActual(): { desde: string; hasta: string } {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - diasDesdeLunes);
  return { desde: fechaLocalISO(lunes), hasta: fechaLocalISO(hoy) };
}

function rangoMesActual(): { desde: string; hasta: string } {
  const hoy = new Date();
  const desde = fechaLocalISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  return { desde, hasta: fechaLocalISO(hoy) };
}

const ROL_VENDEDOR_ETIQUETA: Record<'ADMIN' | 'VENDEDOR', string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
};

function VentasPorVendedorSection() {
  const router = useRouter();
  const [rangoInicial] = useState(rangoMesActual);
  const [desde, setDesde] = useState(rangoInicial.desde);
  const [hasta, setHasta] = useState(rangoInicial.hasta);
  const [datos, setDatos] = useState<VentasPorVendedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ultimoRangoRef = useRef(rangoInicial);

  const consultar = useCallback(
    async (
      desdeParam: string,
      hastaParam: string,
      opciones?: { silencioso?: boolean },
    ): Promise<void> => {
      const silencioso = opciones?.silencioso ?? false;
      if (!silencioso) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const resultado = await obtenerVentasPorVendedor(desdeParam, hastaParam);
        ultimoRangoRef.current = { desde: desdeParam, hasta: hastaParam };
        setDatos((anterior) =>
          mismoContenido(anterior, resultado) ? anterior : resultado,
        );
        setError(null);
      } catch (err) {
        if (silencioso) throw err;
        setDatos(null);
        setError(
          err instanceof ApiError
            ? err.message
            : 'No pudimos cargar las ventas por vendedor. Inténtalo nuevamente.',
        );
      } finally {
        if (!silencioso) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void consultar(rangoInicial.desde, rangoInicial.hasta);
    });
    return () => {
      cancelled = true;
    };
  }, [consultar, rangoInicial]);

  const cargarParaRefresco = useCallback(async (): Promise<void> => {
    const { desde: desdeConsultado, hasta: hastaConsultado } =
      ultimoRangoRef.current;
    await consultar(desdeConsultado, hastaConsultado, { silencioso: true });
  }, [consultar]);

  const { ultimaActualizacion, actualizando, hayError, refrescar } = useAutoRefresh(
    cargarParaRefresco,
    { intervaloMs: 30000 },
  );

  function aplicarRango(rango: { desde: string; hasta: string }): void {
    setDesde(rango.desde);
    setHasta(rango.hasta);
    void consultar(rango.desde, rango.hasta);
  }

  function irAVentas(fila: VentaPorVendedorFila): void {
    const params = new URLSearchParams({ desde, hasta });
    if (fila.vendedor) params.set('vendedorId', String(fila.vendedor.id));
    router.push(`/ventas?${params.toString()}`);
  }

  const filas = datos?.filas ?? [];
  const totales = datos?.totales;

  return (
    <Card
      title="Ventas por vendedor"
      subtitle="Rendimiento del equipo en el período seleccionado."
      actions={
        <IndicadorActualizacion
          ultimaActualizacion={ultimaActualizacion}
          actualizando={actualizando}
          hayError={hayError}
          refrescar={refrescar}
        />
      }
      className="border-zinc-200/80 shadow-sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => aplicarRango(rangoHoy())}
            >
              <LuCalendarDays aria-hidden="true" size={14} />
              Hoy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => aplicarRango(rangoSemanaActual())}
            >
              <LuCalendarDays aria-hidden="true" size={14} />
              Esta semana
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => aplicarRango(rangoMesActual())}
            >
              <LuCalendarDays aria-hidden="true" size={14} />
              Este mes
            </Button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Desde"
              type="date"
              value={desde}
              max={hasta || undefined}
              disabled={isLoading}
              onChange={(event) => setDesde(event.target.value)}
            />
            <Input
              label="Hasta"
              type="date"
              value={hasta}
              min={desde || undefined}
              disabled={isLoading}
              onChange={(event) => setHasta(event.target.value)}
            />
          </div>

          <Button
            type="button"
            disabled={isLoading || !desde || !hasta}
            onClick={() => void consultar(desde, hasta)}
            className="w-full lg:w-auto"
          >
            {isLoading ? 'Consultando…' : 'Consultar'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2" aria-hidden="true">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
            ))}
            <span className="sr-only">Cargando ventas por vendedor…</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void consultar(desde, hasta)}
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : filas.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-5 text-center">
            <p className="text-sm font-semibold text-zinc-800">
              No hay ventas en el período seleccionado
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Probá con otro rango de fechas para ver el rendimiento del equipo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Vendedor
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ventas
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total vendido
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ticket promedio
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Anuladas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {filas.map((fila) => (
                  <tr
                    key={fila.vendedor?.id ?? 'sin-vendedor'}
                    tabIndex={0}
                    aria-label={
                      fila.vendedor
                        ? `Ver ventas de ${fila.vendedor.nombre} entre ${desde} y ${hasta}`
                        : `Ver ventas sin vendedor asignado entre ${desde} y ${hasta}`
                    }
                    onClick={() => irAVentas(fila)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        irAVentas(fila);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-900"
                  >
                    <td className="px-4 py-3">
                      {fila.vendedor ? (
                        <span className="flex flex-col">
                          <span className="font-medium text-zinc-900">{fila.vendedor.nombre}</span>
                          <span className="text-xs text-zinc-500">
                            {ROL_VENDEDOR_ETIQUETA[fila.vendedor.rol] ?? fila.vendedor.rol}
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">Sin vendedor asignado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-700">
                      {fila.cantidadVentas.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-zinc-900">
                      {formatCurrency(fila.totalVendido)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-700">
                      {formatCurrency(fila.ticketPromedio)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-700">
                      <span className="block">{fila.anuladas.cantidad.toLocaleString('es-AR')}</span>
                      <span className="block text-xs text-zinc-500">
                        {formatCurrency(fila.anuladas.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {totales && (
                <tfoot>
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-zinc-900">
                    <td className="px-4 py-3">Totales</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {totales.cantidadVentas.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(totales.totalVendido)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(totales.ticketPromedio)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="block">{totales.anuladas.cantidad.toLocaleString('es-AR')}</span>
                      <span className="block text-xs text-zinc-500">
                        {formatCurrency(totales.anuladas.total)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const { soloLectura, motivoSoloLectura } = useSuscripcion();
  const isAdmin = user?.rol === 'ADMIN';

  const [usuarios, setUsuarios] = useState<BackendUsuario[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, totalPaginas: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [todosUsuarios, setTodosUsuarios] = useState<BackendUsuario[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<AuthRole>('VENDEDOR');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toggleTarget, setToggleTarget] = useState<BackendUsuario | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BackendUsuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const hayFiltros =
    busqueda.trim() !== '' || filtroRol !== 'todos' || filtroEstado !== 'todos';

  const cargarPagina = useCallback(async (pagina: number): Promise<void> => {
    setIsLoading(true);
    setListError(null);
    try {
      const resultado = await listarUsuariosPaginados(pagina, PAGE_SIZE);
      setUsuarios(resultado.usuarios);
      setMeta(resultado.meta);
    } catch (err) {
      setUsuarios([]);
      setListError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos cargar los usuarios. Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cargarTodasParaFiltrar = useCallback(async (): Promise<void> => {
    setIsFiltering(true);
    setFilterError(null);
    try {
      setTodosUsuarios(await listarUsuarios());
    } catch (err) {
      setTodosUsuarios([]);
      setFilterError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos aplicar los filtros. Inténtalo nuevamente.',
      );
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const cargarListado = useCallback(async (pagina = page): Promise<void> => {
    if (hayFiltros) {
      await cargarTodasParaFiltrar();
    } else {
      await cargarPagina(pagina);
    }
  }, [cargarPagina, cargarTodasParaFiltrar, hayFiltros, page]);

  useEffect(() => {
    async function cargarInicial(): Promise<void> {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }
      if (hayFiltros) {
        await cargarTodasParaFiltrar();
      } else {
        await cargarPagina(page);
      }
    }
    void cargarInicial();
  }, [isAdmin, hayFiltros, page, cargarPagina, cargarTodasParaFiltrar]);

  function comenzarEdicion(usuario: BackendUsuario): void {
    setEditingId(usuario.id);
    setFormError(null);
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setPassword('');
    setRol(usuario.rol);
    setIsFormOpen(true);
  }

  function cancelarEdicion(): void {
    setEditingId(null);
    setIsFormOpen(false);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('VENDEDOR');
    setFormError(null);
  }

  function nuevoUsuario(): void {
    cancelarEdicion();
    setIsFormOpen(true);
  }

  async function guardarUsuario(): Promise<void> {
    if (isSubmitting) return;
    if (!nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    if (!email.trim()) {
      setFormError('El email es obligatorio.');
      return;
    }
    if (editingId === null && password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const esEdicion = editingId !== null;
      if (!esEdicion) {
        await crearUsuario({ nombre: nombre.trim(), email: email.trim(), password, rol });
      } else {
        await actualizarUsuario(editingId, {
          nombre: nombre.trim(),
          email: email.trim(),
          rol,
        });
      }
      notifySuccess(
        esEdicion ? 'Datos del equipo actualizados' : 'Acceso creado',
        `${nombre.trim()} ${esEdicion ? 'ya tiene sus datos actualizados.' : 'ya puede acceder al comercio.'}`,
      );
      cancelarEdicion();
      await cargarListado();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar el usuario. Inténtalo nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmarToggle(): Promise<void> {
    if (!toggleTarget || isToggling) return;
    setToggleError(null);
    setIsToggling(true);
    try {
      const usuario = toggleTarget;
      const ahoraActivo = !usuario.activo;
      await actualizarUsuario(usuario.id, { activo: ahoraActivo });
      notifySuccess(
        ahoraActivo ? 'Acceso activado' : 'Acceso desactivado',
        `${usuario.nombre} ${ahoraActivo ? 'ya puede ingresar al sistema.' : 'ya no puede ingresar al sistema.'}`,
      );
      setToggleTarget(null);
      await cargarListado();
    } catch (err) {
      setToggleError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos actualizar el usuario. Inténtalo nuevamente.',
      );
    } finally {
      setIsToggling(false);
    }
  }

  async function confirmarEliminacion(): Promise<void> {
    if (!deleteTarget || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      const usuario = deleteTarget;
      const resultado = await eliminarUsuario(usuario.id);
      if (resultado.modo === 'ELIMINADO') {
        notifySuccess(
          'Empleado eliminado',
          `${usuario.nombre} se eliminó por completo.`,
        );
      } else {
        notifySuccess(
          'Empleado dado de baja',
          `${usuario.nombre} dejó de aparecer y no puede ingresar; su nombre queda en el historial.`,
        );
      }
      setDeleteTarget(null);
      await cargarListado();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos eliminar al empleado. Inténtalo nuevamente.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const usuariosBase = hayFiltros ? todosUsuarios : usuarios;
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    return usuariosBase.filter((usuario) => {
      if (
        texto &&
        !`${usuario.nombre} ${usuario.email}`.toLocaleLowerCase('es-AR').includes(texto)
      ) {
        return false;
      }
      if (filtroRol !== 'todos' && usuario.rol !== filtroRol) return false;
      if (filtroEstado === 'activos' && !usuario.activo) return false;
      if (filtroEstado === 'inactivos' && usuario.activo) return false;
      return true;
    });
  }, [usuariosBase, busqueda, filtroRol, filtroEstado]);
  const total = hayFiltros ? todosUsuarios.length : meta.total;
  const usuariosResumen = hayFiltros ? usuariosFiltrados : usuarios;
  const vendedores = usuariosResumen.filter((usuario) => usuario.rol === 'VENDEDOR').length;
  const activos = usuariosResumen.filter((usuario) => usuario.activo).length;
  const totalPaginasVisibles = hayFiltros
    ? Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE))
    : Math.max(1, meta.totalPaginas);
  const paginaVisible = Math.min(page, totalPaginasVisibles);
  const usuariosVisibles = hayFiltros
    ? usuariosFiltrados.slice((paginaVisible - 1) * PAGE_SIZE, paginaVisible * PAGE_SIZE)
    : usuarios;
  const filas: FilaUsuario[] = usuariosVisibles.map((usuario) => ({
    ...usuario,
    onEdit: () => comenzarEdicion(usuario),
    onToggleActive: () => {
      setToggleError(null);
      setToggleTarget(usuario);
    },
    onDelete: () => {
      setDeleteError(null);
      setDeleteTarget(usuario);
    },
    puedeEliminar: usuario.id !== user?.id && usuario.rol !== 'ADMIN',
    soloLectura,
    motivoSoloLectura,
  }));
  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title="Equipo"
          description="Administra los accesos del personal del comercio."
        />
        <Card title="Acceso restringido">
          <p className="text-sm text-zinc-500">
            La gestión del equipo está disponible únicamente para administradores.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Equipo"
        description="Gestioná quién puede acceder al comercio y qué permisos tiene cada persona."
        actions={
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={nuevoUsuario}
            disabled={soloLectura}
            title={soloLectura ? motivoSoloLectura : undefined}
          >
            <LuPlus aria-hidden="true" size={16} />
            Agregar empleado
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        <section aria-label="Resumen del equipo" className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <Reveal delay={0}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-10 sm:w-10">
                  <LuUsers aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">Personas</p>
                    <HelpTooltip text="Cantidad total de personas registradas en el equipo." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering ? '—' : total.toLocaleString('es-AR')}
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
                      Activos
                    </p>
                    <HelpTooltip text="Personas activas dentro de los resultados o de la página visible." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering ? '—' : activos.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 sm:h-10 sm:w-10">
                  <LuBriefcaseBusiness aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">
                      Vendedores
                    </p>
                    <HelpTooltip text="Vendedores dentro de los resultados o de la página visible." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering ? '—' : vendedores.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card className="border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 sm:h-10 sm:w-10">
                  <LuCircleX aria-hidden="true" size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-medium leading-tight text-zinc-500 sm:text-xs">
                      Sin acceso
                    </p>
                    <HelpTooltip text="Personas inactivas dentro de los resultados o de la página visible." />
                  </div>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950 sm:text-xl">
                    {isLoading || isFiltering
                      ? '—'
                      : (usuariosResumen.length - activos).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>

        <Reveal delay={0.12}>
          <VentasPorVendedorSection />
        </Reveal>

        <Reveal delay={0.15}>
          <Card
            title="Buscar y filtrar el equipo"
            subtitle="Encontrá personas por nombre o correo y acotá por permisos o acceso."
            actions={<LuFilter aria-hidden="true" size={16} className="text-zinc-400" />}
            className="border-zinc-200/80 shadow-sm"
          >
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <SearchInput
                id="buscar-usuario"
                label="Nombre o correo"
                placeholder="Ej. María Gómez, maria@comercio.com"
                value={busqueda}
                onChange={(valor) => {
                  setBusqueda(valor);
                  setPage(1);
                }}
              />
              <Select
                label="Permisos"
                value={filtroRol}
                onChange={(event) => {
                  setFiltroRol(event.target.value);
                  setPage(1);
                }}
                options={ROL_OPCIONES}
              />
              <Select
                label="Acceso"
                value={filtroEstado}
                onChange={(event) => {
                  setFiltroEstado(event.target.value);
                  setPage(1);
                }}
                options={ESTADO_OPCIONES}
              />
            </div>
            {hayFiltros && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
                <p className="text-xs text-zinc-500">
                  {usuariosFiltrados.length.toLocaleString('es-AR')}{' '}
                  {usuariosFiltrados.length === 1 ? 'persona encontrada' : 'personas encontradas'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroRol('todos');
                    setFiltroEstado('todos');
                    setPage(1);
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card
            title="Personas del equipo"
            subtitle={
              hayFiltros
                ? `${usuariosFiltrados.length.toLocaleString('es-AR')} resultados de ${total}`
                : `${total.toLocaleString('es-AR')} personas registradas`
            }
            className="border-zinc-200/80 shadow-sm"
          >
          {isLoading || isFiltering ? (
            <div className="flex flex-col gap-2" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
              <span className="sr-only">Cargando usuarios…</span>
            </div>
          ) : hayFiltros && filterError ? (
            <div>
              <p className="text-sm text-zinc-500">{filterError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarTodasParaFiltrar()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : !hayFiltros && listError ? (
            <div>
              <p className="text-sm text-zinc-500">{listError}</p>
              <div className="mt-4">
                <Button type="button" onClick={() => void cargarListado()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={USUARIO_COLUMNAS}
                data={filas}
                getRowKey={(row) => row.id}
                emptyMessage={
                  hayFiltros
                    ? 'No encontramos personas con esos filtros.'
                    : 'Todavía no hay personas en el equipo.'
                }
              />
              <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-zinc-500">
                  {hayFiltros
                    ? `${usuariosFiltrados.length === 0 ? 0 : (paginaVisible - 1) * PAGE_SIZE + 1}–${Math.min(paginaVisible * PAGE_SIZE, usuariosFiltrados.length)} de ${usuariosFiltrados.length}`
                    : `Página ${paginaVisible} de ${totalPaginasVisibles} · ${meta.total} personas`}
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

      <Modal
        open={isFormOpen}
        title={editingId === null ? 'Agregar empleado' : 'Editar persona'}
        description={
          editingId === null
            ? 'Creá un acceso individual para una persona de tu equipo.'
            : 'Actualizá los datos y permisos de acceso de esta persona.'
        }
        size="md"
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
              form="usuario-formulario"
              disabled={isSubmitting || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
            >
              <LuSave aria-hidden="true" size={16} />
              {isSubmitting
                ? 'Guardando…'
                : editingId === null
                  ? 'Crear acceso'
                  : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <form
          id="usuario-formulario"
          onSubmit={(event) => {
            event.preventDefault();
            void guardarUsuario();
          }}
          className="stocknext-modal-form stocknext-form flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_24px_-18px_rgba(15,23,42,0.35)]"
        >
          <FormField label="Nombre completo" htmlFor="usuario-nombre" required>
            <Input
              id="usuario-nombre"
              placeholder="Ej: Carlos Rodríguez"
              autoComplete="name"
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </FormField>
          <FormField label="Correo electrónico" htmlFor="usuario-email" required>
            <Input
              id="usuario-email"
              type="email"
              placeholder="Ej: carlos@comercio.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          {editingId === null && (
            <FormField
              label="Contraseña inicial"
              htmlFor="usuario-password"
              required
              hint="Debe tener al menos 6 caracteres."
            >
              <Input
                id="usuario-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
          )}
          <FormField label="Permisos del sistema" htmlFor="usuario-rol" required>
            <Select
              id="usuario-rol"
              value={rol}
              onChange={(event) => setRol(event.target.value as AuthRole)}
              options={NUEVO_USUARIO_ROL_OPCIONES}
            />
          </FormField>
          <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <p>
              <strong>Vendedor:</strong> acceso a las operaciones cotidianas del comercio.
            </p>
            <p className="mt-1">
              <strong>Administrador:</strong> acceso completo, incluida la gestión del equipo.
            </p>
          </div>
          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              {formError}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        open={toggleTarget !== null}
        title={toggleTarget?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={
          toggleTarget
            ? toggleTarget.activo
              ? `¿Desactivar a "${toggleTarget.nombre}"? Ya no podrá iniciar sesión.`
              : `¿Activar a "${toggleTarget.nombre}"? Volverá a poder iniciar sesión.`
            : undefined
        }
        onClose={() => {
          if (!isToggling) setToggleTarget(null);
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isToggling}
              onClick={() => setToggleTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={toggleTarget?.activo ? 'danger' : 'primary'}
              disabled={isToggling || soloLectura}
              title={soloLectura ? motivoSoloLectura : undefined}
              onClick={() => void confirmarToggle()}
            >
              {isToggling ? 'Guardando…' : toggleTarget?.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </>
        }
      >
        {toggleError ? (
          <p role="alert" className="text-sm text-red-600">
            {toggleError}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            El cambio se aplica de inmediato en el sistema.
          </p>
        )}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar empleado"
        description={
          deleteTarget ? `¿Eliminar a "${deleteTarget.nombre}"?` : undefined
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
              {isDeleting ? 'Eliminando…' : 'Eliminar empleado'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600">
            Si tiene ventas registradas, se da de baja: deja de aparecer y no puede
            entrar, pero su nombre queda en el historial. Si no tiene ventas, se
            elimina por completo.
          </p>
          {deleteError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
