'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  login as loginRequest,
  logout as logoutRequest,
  onSessionExpired,
  refreshSession as refreshSessionRequest,
} from '@/services/auth.service';
import { tokenStorage } from '@/lib/auth/storage';
import type { AuthRole, AuthStatus, AuthUser, LoginCredentials } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasRole: (role: AuthRole | AuthRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = tokenStorage.getStoredUser();
    return tokenStorage.getAccessToken() ? storedUser : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function initSession(): Promise<void> {
      const storedUser = tokenStorage.getStoredUser();
      const accessToken = tokenStorage.getAccessToken();
      if (!active) return;
      if (!storedUser || !accessToken) {
        setIsLoading(false);
        return;
      }
      await refreshSessionRequest();
      if (active) setIsLoading(false);
    }
    void initSession();
    const unsubscribe = onSessionExpired(() => {
      if (active) setUser(null);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    const authenticatedUser = await loginRequest(credentials);
    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const tokens = await refreshSessionRequest();
    return tokens !== null;
  }, []);

  const hasRole = useCallback(
    (role: AuthRole | AuthRole[]): boolean => {
      if (!user) return false;
      return Array.isArray(role) ? role.includes(user.rol) : user.rol === role;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status: isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      refreshSession,
      hasRole,
    }),
    [user, isLoading, login, logout, refreshSession, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider.');
  }
  return context;
}
