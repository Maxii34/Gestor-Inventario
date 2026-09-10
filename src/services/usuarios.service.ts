import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';
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

export async function listarUsuarios(): Promise<BackendUsuario[]> {
  const response = await apiRequest<ApiSuccess<BackendUsuario[]>>('/usuarios', {
    auth: true,
  });
  return response.data;
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
