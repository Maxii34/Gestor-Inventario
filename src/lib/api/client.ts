import type { ApiErrorBody } from '@/types/api';
import { tokenStorage } from '@/lib/auth/storage';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  auth?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;
let refreshInflight: Promise<string | null> | null = null;

export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

function runRefresh(): Promise<string | null> {
  if (!refreshInflight) {
    const task = async (): Promise<string | null> => {
      try {
        return refreshHandler ? await refreshHandler() : null;
      } finally {
        refreshInflight = null;
      }
    };
    refreshInflight = task();
  }
  return refreshInflight;
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new ApiError(
      0,
      'Falta configurar NEXT_PUBLIC_API_URL para comunicarse con el backend.',
    );
  }
  return baseUrl.replace(/\/$/, '');
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'mensaje' in body) {
    const mensaje = (body as ApiErrorBody).mensaje;
    if (typeof mensaje === 'string' && mensaje.length > 0) return mensaje;
  }
  return fallback;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return requestWithRetry<T>(path, options, false);
}

async function requestWithRetry<T>(
  path: string,
  options: RequestOptions,
  retried: boolean,
): Promise<T> {
  const { method = 'GET', body, headers, signal, auth = false } = options;
  const accessToken = auth ? tokenStorage.getAccessToken() : null;
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...normalizeHeaders(headers),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });
  } catch {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.',
    );
  }
  const responseBody = await readBody(response);
  if (!response.ok) {
    if (response.status === 401 && auth && !retried && refreshHandler) {
      const newAccessToken = await runRefresh();
      if (newAccessToken) {
        return requestWithRetry<T>(path, options, true);
      }
    }
    throw new ApiError(
      response.status,
      extractMessage(responseBody, `Error HTTP ${response.status}.`),
      responseBody,
    );
  }
  return responseBody as T;
}
