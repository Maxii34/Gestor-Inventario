export type AuthRole = 'ADMIN' | 'VENDEDOR';

export interface Comercio {
  id: number;
  nombre: string;
  slug: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: AuthRole;
  activo: boolean;
  debeCambiarPassword?: boolean;
  comercioId: number;
  fechaCreacion: string;
}

export interface LoginCredentials {
  slug: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData extends AuthTokens {
  usuario: AuthUser;
  comercio: Comercio;
}

export type RefreshResponseData = AuthTokens;

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
