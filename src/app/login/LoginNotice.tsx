'use client';

import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAvisoLoginSnapshot,
  onAvisoLogin,
} from '@/lib/auth/notices';

const AVISOS: Record<string, string> = {
  registro:
    'El comercio se registró correctamente, pero no pudimos iniciar sesión automáticamente. Ingresá con tus credenciales.',
};

export function LoginNotice() {
  const searchParams = useSearchParams();
  const aviso = searchParams.get('aviso');
  const avisoSesion = useSyncExternalStore(
    onAvisoLogin,
    getAvisoLoginSnapshot,
    () => null,
  );

  const mensaje = aviso ? AVISOS[aviso] : avisoSesion;

  if (!mensaje) return null;

  return (
    <p
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
    >
      {mensaje}
    </p>
  );
}
