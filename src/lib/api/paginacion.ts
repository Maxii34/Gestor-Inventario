import { apiRequest } from './client';
import type { ApiListResponse } from '@/types/api';

export const LIMITE_PAGINA = 100;
export const MAX_PAGINAS = 50;

export type ParametrosPagina = Record<string, string | number | boolean | undefined>;

export async function cargarTodasLasPaginas<T>(
  endpoint: string,
  params: ParametrosPagina = {},
): Promise<T[]> {
  const resultados: T[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const query = new URLSearchParams({
      page: String(pagina),
      limit: String(LIMITE_PAGINA),
    });
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== undefined) query.set(clave, String(valor));
    }

    const response = await apiRequest<ApiListResponse<T>>(
      `${endpoint}?${query.toString()}`,
      { auth: true },
    );
    resultados.push(...response.data);
    totalPaginas = response.meta?.totalPaginas ?? 0;
    pagina += 1;
  } while (pagina <= totalPaginas && pagina <= MAX_PAGINAS);

  return resultados;
}
