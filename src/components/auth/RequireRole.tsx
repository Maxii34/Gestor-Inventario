'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { AuthRole } from '@/types/auth';

interface RequireRoleProps {
  role: AuthRole | AuthRole[];
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { hasRole, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const allowed = hasRole(role);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !allowed) {
      router.replace('/dashboard?aviso=sin-permiso');
    }
  }, [isLoading, isAuthenticated, allowed, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-500">Verificando permisos…</p>
      </div>
    );
  }

  if (!isAuthenticated || !allowed) return null;

  return <>{children}</>;
}
