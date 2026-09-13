import { apiRequest } from '@/lib/api/client';
import type { ApiListResponse, ApiSuccess, PageMeta } from '@/types/api';

export interface BackendCliente {
  id: number;
  nombre: string;
  apellido: string;
  dni?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
}

export interface ClienteInput {
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  email?: string;
}

export interface ClientesPaginados {
  clientes: BackendCliente[];
  meta: PageMeta;
}

export async function listarClientes(page: number, limit: number): Promise<ClientesPaginados> {
  const response = await apiRequest<ApiListResponse<BackendCliente>>(
    `/clientes?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { clientes: response.data, meta: response.meta };
}

export async function obtenerCliente(id: number): Promise<BackendCliente> {
  const response = await apiRequest<ApiSuccess<BackendCliente>>(`/clientes/${id}`, {
    auth: true,
  });
  return response.data;
}

export async function crearCliente(input: ClienteInput): Promise<BackendCliente> {
  const response = await apiRequest<ApiSuccess<BackendCliente>>('/clientes', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function actualizarCliente(
  id: number,
  input: Partial<ClienteInput>,
): Promise<BackendCliente> {
  const response = await apiRequest<ApiSuccess<BackendCliente>>(`/clientes/${id}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function eliminarCliente(id: number): Promise<void> {
  await apiRequest<unknown>(`/clientes/${id}`, { method: 'DELETE', auth: true });
}
