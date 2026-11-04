import { apiRequest, ApiError } from '@/lib/api/client';
import { plataformaTokenStorage } from '@/lib/auth/plataforma-storage';
import type { ApiListResponse, ApiSuccess, PageMeta } from '@/types/api';

export type EstadoComercio =
  | 'SUSPENDIDO'
  | 'SIN_VENCIMIENTO'
  | 'VIGENTE'
  | 'EN_GRACIA'
  | 'VENCIDA';

export type PlanComercio = 'PRUEBA' | 'MENSUAL' | 'TRIMESTRAL';
export type MetodoPago = 'TRANSFERENCIA' | 'EFECTIVO' | 'OTRO';

export interface PlataformaComercio {
  id: number;
  nombre: string;
  slug?: string;
  activo?: boolean;
  estado?: EstadoComercio | string;
  estadoSuscripcion?: EstadoComercio | string;
  plan?: PlanComercio | string;
  accesoHasta?: string | null;
  adminNombre?: string;
  adminEmail?: string;
  administrador?: { nombre?: string; email?: string } | null;
  admin?: { nombre?: string; email?: string } | null;
  usuarios?: { nombre?: string; email?: string; rol?: string }[];
  _count?: { usuarios?: number };
  conteos?: { usuarios?: number };
  email?: string;
  fechaCreacion?: string;
  fechaVencimiento?: string | null;
  venceEn?: string | null;
  diasRestantes?: number;
  motivoSuspension?: string | null;
  [key: string]: unknown;
}

export interface PlataformaPago {
  id: number;
  plan?: string;
  meses?: number;
  monto?: number | string;
  metodo?: string;
  referencia?: string | null;
  nota?: string | null;
  fecha?: string;
  fechaCreacion?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PlataformaUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR';
  activo: boolean;
  debeCambiarPassword: boolean;
  fechaCreacion: string;
}

export interface ErrorFilaCarga {
  fila: number;
  campo?: string;
  mensaje: string;
}

export interface ResultadoCargaMasiva {
  simulacion?: boolean;
  validas?: number;
  creados?: number;
  errores?: ErrorFilaCarga[];
}

export interface PlataformaAuditoria {
  id: number | string;
  accion?: string;
  evento?: string;
  descripcion?: string;
  detalle?: unknown;
  usuario?: string | { nombre?: string; email?: string };
  comercio?: string | { id?: number; nombre?: string };
  comercioId?: number;
  superadminId?: number;
  fecha?: string;
  fechaCreacion?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export type PlataformaMeta = PageMeta;

export interface ListadoComercios {
  comercios: PlataformaComercio[];
  meta: PlataformaMeta;
}

export interface ListadoPagos {
  pagos: PlataformaPago[];
  meta: PlataformaMeta;
}

export interface ListadoAuditoria {
  eventos: PlataformaAuditoria[];
  meta: PlataformaMeta;
}

export interface CrearComercioInput {
  nombre: string;
  slug?: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
  dias?: number;
}

export interface RegistrarPagoInput {
  plan: 'MENSUAL' | 'TRIMESTRAL';
  meses: number;
  monto: number;
  metodo: MetodoPago;
  referencia?: string;
  nota?: string;
}

export interface EditarUsuarioPlataformaInput {
  nombre?: string;
  email?: string;
  rol?: PlataformaUsuario['rol'];
  activo?: boolean;
}

export interface CategoriaMasivaInput {
  nombre: string;
  descripcion?: string;
}

export interface ProductoMasivoInput {
  nombre: string;
  descripcion?: string;
  codigoBarras?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo?: number;
  categoria: string;
}

interface LoginResponse {
  accessToken: string;
}

function authHeaders(): HeadersInit {
  const accessToken = plataformaTokenStorage.getAccessToken();
  if (!accessToken) {
    throw new ApiError(401, 'Tu sesión de plataforma expiró. Iniciá sesión nuevamente.');
  }
  return { Authorization: `Bearer ${accessToken}` };
}

function normalizeList<T>(
  response: ApiListResponse<T> | ApiSuccess<T[]>,
): { items: T[]; meta: PlataformaMeta } {
  const listResponse = response as ApiListResponse<T>;
  const data = Array.isArray(response.data) ? response.data : [];
  return {
    items: data,
    meta: listResponse.meta ?? { total: data.length, page: 1, totalPaginas: 1 },
  };
}

export async function iniciarSesionPlataforma(
  email: string,
  password: string,
): Promise<void> {
  const response = await apiRequest<ApiSuccess<LoginResponse>>('/plataforma/login', {
    method: 'POST',
    body: { email, password },
  });
  if (!response.data?.accessToken) {
    throw new ApiError(0, 'El servidor no devolvió el token de plataforma.');
  }
  plataformaTokenStorage.setSession(response.data.accessToken, email);
}

export async function listarComercios(params: {
  page: number;
  limit: number;
  q?: string;
  estado?: string;
}): Promise<ListadoComercios> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.q) query.set('q', params.q);
  if (params.estado) query.set('estado', params.estado);

  const response = await apiRequest<ApiListResponse<PlataformaComercio>>(
    `/plataforma/comercios?${query.toString()}`,
    { headers: authHeaders() },
  );
  const { items, meta } = normalizeList(response);
  return { comercios: items, meta };
}

export async function obtenerComercio(id: number): Promise<PlataformaComercio> {
  const response = await apiRequest<ApiSuccess<PlataformaComercio>>(
    `/plataforma/comercios/${id}`,
    { headers: authHeaders() },
  );
  return response.data;
}

export async function crearComercio(
  input: CrearComercioInput,
): Promise<PlataformaComercio> {
  const response = await apiRequest<ApiSuccess<PlataformaComercio>>(
    '/plataforma/comercios',
    { method: 'POST', body: input, headers: authHeaders() },
  );
  return response.data;
}

export async function suspenderComercio(id: number, motivo: string): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/plataforma/comercios/${id}/suspender`, {
    method: 'POST',
    body: { motivo },
    headers: authHeaders(),
  });
}

export async function reactivarComercio(id: number): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/plataforma/comercios/${id}/reactivar`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function extenderComercio(id: number, dias: number): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/plataforma/comercios/${id}/extender`, {
    method: 'POST',
    body: { dias },
    headers: authHeaders(),
  });
}

export async function cambiarPlanComercio(
  id: number,
  plan: PlanComercio,
): Promise<void> {
  await apiRequest<ApiSuccess<unknown>>(`/plataforma/comercios/${id}/cambiar-plan`, {
    method: 'POST',
    body: { plan },
    headers: authHeaders(),
  });
}

export async function registrarPago(
  id: number,
  input: RegistrarPagoInput,
): Promise<PlataformaPago> {
  const response = await apiRequest<ApiSuccess<PlataformaPago>>(
    `/plataforma/comercios/${id}/pagos`,
    { method: 'POST', body: input, headers: authHeaders() },
  );
  return response.data;
}

export async function listarPagos(
  id: number,
  page = 1,
  limit = 10,
): Promise<ListadoPagos> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await apiRequest<ApiListResponse<PlataformaPago>>(
    `/plataforma/comercios/${id}/pagos?${query.toString()}`,
    { headers: authHeaders() },
  );
  const { items, meta } = normalizeList(response);
  return { pagos: items, meta };
}

export async function listarAuditoria(params: {
  page: number;
  limit: number;
  comercioId?: string;
}): Promise<ListadoAuditoria> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.comercioId) query.set('comercioId', params.comercioId);

  const response = await apiRequest<ApiListResponse<PlataformaAuditoria>>(
    `/plataforma/auditoria?${query.toString()}`,
    { headers: authHeaders() },
  );
  const { items, meta } = normalizeList(response);
  return { eventos: items, meta };
}

export async function obtenerMetricas(): Promise<Record<string, unknown>> {
  const response = await apiRequest<ApiSuccess<Record<string, unknown>>>(
    '/plataforma/metricas',
    { headers: authHeaders() },
  );
  return response.data;
}

export async function listarUsuariosComercio(
  comercioId: number,
  page: number,
  limit: number,
  q?: string,
): Promise<{ usuarios: PlataformaUsuario[]; meta: PlataformaMeta }> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) query.set('q', q);
  const response = await apiRequest<ApiListResponse<PlataformaUsuario>>(
    `/plataforma/comercios/${comercioId}/usuarios?${query.toString()}`,
    { headers: authHeaders() },
  );
  return { usuarios: response.data, meta: response.meta };
}

export async function editarUsuarioComercio(
  comercioId: number,
  usuarioId: number,
  input: EditarUsuarioPlataformaInput,
): Promise<PlataformaUsuario> {
  const response = await apiRequest<ApiSuccess<PlataformaUsuario>>(
    `/plataforma/comercios/${comercioId}/usuarios/${usuarioId}`,
    { method: 'PUT', body: input, headers: authHeaders() },
  );
  return response.data;
}

export async function resetearPasswordUsuario(
  comercioId: number,
  usuarioId: number,
): Promise<string> {
  const response = await apiRequest<ApiSuccess<{ passwordTemporal: string }>>(
    `/plataforma/comercios/${comercioId}/usuarios/${usuarioId}/resetear-password`,
    { method: 'POST', headers: authHeaders() },
  );
  return response.data.passwordTemporal;
}

export async function cargarCategoriasMasivas(
  comercioId: number,
  categorias: CategoriaMasivaInput[],
  simular: boolean,
): Promise<ResultadoCargaMasiva> {
  const response = await apiRequest<ApiSuccess<ResultadoCargaMasiva>>(
    `/plataforma/comercios/${comercioId}/categorias/masivo`,
    { method: 'POST', body: { categorias, simular }, headers: authHeaders() },
  );
  return response.data;
}

export async function cargarProductosMasivos(
  comercioId: number,
  productos: ProductoMasivoInput[],
  simular: boolean,
): Promise<ResultadoCargaMasiva> {
  const response = await apiRequest<ApiSuccess<ResultadoCargaMasiva>>(
    `/plataforma/comercios/${comercioId}/productos/masivo`,
    { method: 'POST', body: { productos, simular }, headers: authHeaders() },
  );
  return response.data;
}
