import { apiRequest, setRefreshHandler, ApiError } from '@/lib/api/client';
import { tokenStorage } from '@/lib/auth/storage';
import type { ApiSuccess } from '@/types/api';
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponseData,
  RefreshResponseData,
} from '@/types/auth';

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function emitSessionExpired(): void {
  sessionExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Los listeners no deben romper el flujo de cierre de sesión.
    }
  });
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiRequest<ApiSuccess<LoginResponseData>>('/usuarios/login', {
    method: 'POST',
    body: credentials,
  });
  tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
  tokenStorage.setStoredUser(response.data.usuario);
  return response.data.usuario;
}

export async function refreshSession(): Promise<AuthTokens | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await apiRequest<ApiSuccess<RefreshResponseData>>(
      '/usuarios/refresh',
      { method: 'POST', body: { refreshToken } },
    );
    const tokens: AuthTokens = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  } catch (error) {
    if (error instanceof ApiError && error.status !== 0) {
      tokenStorage.clear();
      emitSessionExpired();
    }
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (refreshToken) {
    try {
      await apiRequest<unknown>('/usuarios/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    } catch {
      // La limpieza local se garantiza aunque el backend falle.
    }
  }
  tokenStorage.clear();
}

setRefreshHandler(async () => {
  const tokens = await refreshSession();
  return tokens ? tokens.accessToken : null;
});
