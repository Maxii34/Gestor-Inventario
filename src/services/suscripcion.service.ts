import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';
import type { SuscripcionEstado } from '@/types/suscripcion';

export async function obtenerSuscripcion(): Promise<SuscripcionEstado> {
  const response = await apiRequest<ApiSuccess<SuscripcionEstado>>('/suscripcion', {
    auth: true,
  });
  return response.data;
}
