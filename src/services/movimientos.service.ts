import { apiRequest } from '@/lib/api/client';
import type { ApiListResponse, ApiSuccess, PageMeta } from '@/types/api';

export type TipoMovimientoBackend = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface BackendMovimientoProducto {
  id: number;
  nombre: string;
}

export interface BackendMovimiento {
  id: number;
  tipo: TipoMovimientoBackend;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string | null;
  producto?: BackendMovimientoProducto | null;
  fecha: string;
}

export interface MovimientoInput {
  tipo: TipoMovimientoBackend;
  cantidad: number;
  productoId: number;
  motivo?: string;
}

export interface MovimientosPaginados {
  movimientos: BackendMovimiento[];
  meta: PageMeta;
}

export async function listarMovimientos(
  page: number,
  limit: number,
): Promise<MovimientosPaginados> {
  const response = await apiRequest<ApiListResponse<BackendMovimiento>>(
    `/movimientos?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { movimientos: response.data, meta: response.meta };
}

export async function registrarMovimiento(
  input: MovimientoInput,
): Promise<BackendMovimiento> {
  const response = await apiRequest<ApiSuccess<BackendMovimiento>>('/movimientos', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}
