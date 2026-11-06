import { apiRequest } from '@/lib/api/client';
import { cargarTodasLasPaginas } from '@/lib/api/paginacion';
import type { ApiListResponse, PageMeta, ApiSuccess } from '@/types/api';
import type { AuthRole } from '@/types/auth';

export interface BackendUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: AuthRole;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: AuthRole;
}

export interface UsuarioUpdateInput {
  nombre?: string;
  email?: string;
  rol?: AuthRole;
  activo?: boolean;
}

export interface UsuariosPaginados {
  usuarios: BackendUsuario[];
  meta: PageMeta;
}

export async function listarUsuarios(): Promise<BackendUsuario[]> {
  return cargarTodasLasPaginas<BackendUsuario>('/usuarios');
}

export async function listarUsuariosPaginados(
  page: number,
  limit: number,
): Promise<UsuariosPaginados> {
  const response = await apiRequest<ApiListResponse<BackendUsuario>>(
    `/usuarios?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { usuarios: response.data, meta: response.meta };
}

export async function crearUsuario(input: UsuarioInput): Promise<BackendUsuario> {
  const response = await apiRequest<ApiSuccess<BackendUsuario>>('/usuarios', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function actualizarUsuario(
  id: number,
  input: UsuarioUpdateInput,
): Promise<BackendUsuario> {
  const response = await apiRequest<ApiSuccess<BackendUsuario>>(`/usuarios/${id}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
  return response.data;
}
