import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';

export interface Recaudacion {
  desde: string;
  hasta: string;
  totalRecaudado: number;
}

export async function obtenerRecaudacion(desde: string, hasta: string): Promise<Recaudacion> {
  const params = new URLSearchParams({ desde, hasta });
  const response = await apiRequest<ApiSuccess<Recaudacion>>(
    `/estadisticas/recaudacion?${params.toString()}`,
    { auth: true },
  );
  return response.data;
}
