// Envoltorio de éxito que devuelve el backend: { ok: true, mensaje, data }.
export interface ApiSuccess<T> {
  ok: true;
  mensaje: string;
  data: T;
}

// Formato de error que devuelve el backend: { ok: false, mensaje: '...' }.
export interface ApiErrorBody {
  ok: false;
  mensaje: string;
}

// Listados del backend: { ok: true, mensaje, data: [], meta } con meta top-level.
export interface ApiListResponse<T> {
  ok: true;
  mensaje: string;
  data: T[];
  meta: PageMeta;
}

// Paginación del backend: meta.total, meta.page, meta.totalPaginas.
export interface PageMeta {
  total: number;
  page: number;
  totalPaginas: number;
}

export interface PaginatedResponse<T> {
  datos: T[];
  meta: PageMeta;
}
