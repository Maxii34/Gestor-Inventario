import { apiRequest } from '@/lib/api/client';
import type { ApiListResponse, ApiSuccess, PageMeta } from '@/types/api';

export interface BackendCategoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface BackendProducto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precioCompra: number | string;
  precioVenta: number | string;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  categoriaId: number;
  categoria?: BackendCategoria | null;
}

export interface ProductoInput {
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: number;
}

export interface ProductosPaginados {
  productos: BackendProducto[];
  meta: PageMeta;
}

export async function listarProductos(page: number, limit: number): Promise<ProductosPaginados> {
  const response = await apiRequest<ApiListResponse<BackendProducto>>(
    `/productos?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { productos: response.data, meta: response.meta };
}

export async function obtenerProducto(id: number): Promise<BackendProducto> {
  const response = await apiRequest<ApiSuccess<BackendProducto>>(`/productos/${id}`, {
    auth: true,
  });
  return response.data;
}

export async function crearProducto(input: ProductoInput): Promise<BackendProducto> {
  const response = await apiRequest<ApiSuccess<BackendProducto>>('/productos', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function actualizarProducto(
  id: number,
  input: Partial<ProductoInput>,
): Promise<BackendProducto> {
  const response = await apiRequest<ApiSuccess<BackendProducto>>(`/productos/${id}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await apiRequest<unknown>(`/productos/${id}`, { method: 'DELETE', auth: true });
}

export async function listarCategorias(): Promise<BackendCategoria[]> {
  const response = await apiRequest<ApiSuccess<BackendCategoria[]>>('/categorias', {
    auth: true,
  });
  return response.data;
}
