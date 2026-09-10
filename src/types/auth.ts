export type AuthRole = 'ADMIN' | 'VENDEDOR';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: AuthRole;
  activo: boolean;
  fechaCreacion: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData extends AuthTokens {
  usuario: AuthUser;
}

export type RefreshResponseData = AuthTokens;

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
