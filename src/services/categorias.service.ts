import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';

export interface BackendCategoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
}

export async function listarCategorias(): Promise<BackendCategoria[]> {
  const response = await apiRequest<ApiSuccess<BackendCategoria[]>>('/categorias', {
    auth: true,
  });
  return response.data;
}

export async function crearCategoria(input: CategoriaInput): Promise<BackendCategoria> {
  const response = await apiRequest<ApiSuccess<BackendCategoria>>('/categorias', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function actualizarCategoria(
  id: number,
  input: Partial<CategoriaInput>,
): Promise<BackendCategoria> {
  const response = await apiRequest<ApiSuccess<BackendCategoria>>(`/categorias/${id}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await apiRequest<unknown>(`/categorias/${id}`, { method: 'DELETE', auth: true });
}
