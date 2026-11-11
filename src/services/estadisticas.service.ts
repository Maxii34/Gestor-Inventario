import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';

export interface Recaudacion {
  desde: string;
  hasta: string;
  totalRecaudado: number;
}

export interface VendedorEstadistica {
  id: number;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR';
  activo: boolean;
}

export interface VentaPorVendedorFila {
  vendedor: VendedorEstadistica | null;
  cantidadVentas: number;
  totalVendido: number;
  ticketPromedio: number;
  anuladas: { cantidad: number; total: number };
  ultimaVenta: string | null;
}

export interface VentasPorVendedorTotales {
  cantidadVentas: number;
  totalVendido: number;
  ticketPromedio: number;
  anuladas: { cantidad: number; total: number };
}

export interface VentasPorVendedor {
  desde: string;
  hasta: string;
  filas: VentaPorVendedorFila[];
  totales: VentasPorVendedorTotales;
}

export async function obtenerRecaudacion(desde: string, hasta: string): Promise<Recaudacion> {
  const params = new URLSearchParams({ desde, hasta });
  const response = await apiRequest<ApiSuccess<Recaudacion>>(
    `/estadisticas/recaudacion?${params.toString()}`,
    { auth: true },
  );
  return response.data;
}

export async function obtenerVentasPorVendedor(
  desde: string,
  hasta: string,
): Promise<VentasPorVendedor> {
  const params = new URLSearchParams({ desde, hasta });
  const response = await apiRequest<ApiSuccess<VentasPorVendedor>>(
    `/estadisticas/vendedores?${params.toString()}`,
    { auth: true },
  );
  return response.data;
}
