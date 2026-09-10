import { apiRequest } from '@/lib/api/client';
import type { ApiListResponse, ApiSuccess, PageMeta } from '@/types/api';

export type MetodoPagoBackend = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export type EstadoVentaBackend = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA' | 'RECHAZADA';

export interface BackendVentaCliente {
  id: number;
  nombre: string;
  apellido: string;
}

export interface BackendVentaDetalle {
  id: number;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string;
  productoId: number;
  producto?: { id: number; nombre: string } | null;
}

export interface BackendVenta {
  id: number;
  total: number | string;
  metodoPago: MetodoPagoBackend;
  estado: EstadoVentaBackend;
  cliente?: BackendVentaCliente | null;
  detalles?: BackendVentaDetalle[];
  fecha: string;
}

export interface DetalleVentaInput {
  productoId: number;
  cantidad: number;
}

export interface VentaInput {
  clienteId?: number;
  metodoPago: MetodoPagoBackend;
  detalles: DetalleVentaInput[];
}

export interface VentaCreada {
  ventaId: number;
  initPoint: string;
}

export interface VentasPaginadas {
  ventas: BackendVenta[];
  meta: PageMeta;
}

export async function listarVentas(page: number, limit: number): Promise<VentasPaginadas> {
  const response = await apiRequest<ApiListResponse<BackendVenta>>(
    `/ventas?page=${page}&limit=${limit}`,
    { auth: true },
  );
  return { ventas: response.data, meta: response.meta };
}

export async function obtenerVenta(id: number): Promise<BackendVenta> {
  const response = await apiRequest<ApiSuccess<BackendVenta>>(`/ventas/${id}`, {
    auth: true,
  });
  return response.data;
}

export async function crearVenta(input: VentaInput): Promise<VentaCreada> {
  const response = await apiRequest<ApiSuccess<VentaCreada>>('/ventas', {
    method: 'POST',
    body: input,
    auth: true,
  });
  return response.data;
}

export async function anularVenta(id: number): Promise<BackendVenta> {
  const response = await apiRequest<ApiSuccess<BackendVenta>>(`/ventas/${id}`, {
    method: 'PUT',
    body: { estado: 'ANULADA' },
    auth: true,
  });
  return response.data;
}
