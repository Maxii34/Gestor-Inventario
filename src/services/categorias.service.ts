import { apiRequest } from '@/lib/api/client';
import { cargarTodasLasPaginas } from '@/lib/api/paginacion';
import type { ApiListResponse, PageMeta, ApiSuccess } from '@/types/api';

export interface BackendCategoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriasPaginadas {
  categorias: BackendCategoria[];
  meta: PageMeta;
}

export async function listarCategorias(): Promise<BackendCategoria[]> {
  return cargarTodasLasPaginas<BackendCategoria>('/categorias');
}

export async function listarCategoriasPaginadas(
  page: number,
  limit: number,
): Promise<CategoriasPaginadas> {
  const response = await apiRequest<ApiListResponse<BackendCategoria>>(
    `/categorias?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { categorias: response.data, meta: response.meta };
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
