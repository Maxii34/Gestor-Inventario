import { apiRequest } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';
import type { AuthRole, Comercio } from '@/types/auth';

export interface RegistrarComercioInput {
  nombre: string;
  slug?: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
}

export interface ComercioAdministrador {
  id: number;
  nombre: string;
  email: string;
  rol: AuthRole;
  activo: boolean;
  comercioId: number;
  fechaCreacion: string;
}

export interface ComercioRegistrado {
  comercio: Comercio;
  administrador: ComercioAdministrador;
}

export async function registrarComercio(
  input: RegistrarComercioInput,
): Promise<ComercioRegistrado> {
  const response = await apiRequest<ApiSuccess<ComercioRegistrado>>('/comercios/registrar', {
    method: 'POST',
    body: input,
  });
  return response.data;
}
