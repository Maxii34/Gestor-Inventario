const ACCESS_TOKEN_KEY = 'gestor.plataforma.accessToken';
const EMAIL_KEY = 'gestor.plataforma.email';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const plataformaTokenStorage = {
  getAccessToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },

  getEmail(): string | null {
    return isBrowser() ? window.localStorage.getItem(EMAIL_KEY) : null;
  },

  setSession(accessToken: string, email: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(EMAIL_KEY, email);
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(EMAIL_KEY);
  },
};
