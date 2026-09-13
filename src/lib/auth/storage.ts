import type { AuthUser } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'gestor.accessToken';
const REFRESH_TOKEN_KEY = 'gestor.refreshToken';
const USER_KEY = 'gestor.user';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key);
}

function write(key: string, value: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, value);
}

function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return read(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return read(REFRESH_TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const raw = read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    write(ACCESS_TOKEN_KEY, accessToken);
    write(REFRESH_TOKEN_KEY, refreshToken);
  },

  setStoredUser(user: AuthUser): void {
    write(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    remove(ACCESS_TOKEN_KEY);
    remove(REFRESH_TOKEN_KEY);
    remove(USER_KEY);
  },
};
