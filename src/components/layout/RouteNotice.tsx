'use client';

import { useSearchParams } from 'next/navigation';

const AVISOS: Record<string, string> = {
  'sin-permiso': 'No tenés permisos para acceder a esa sección.',
  'modulo-inactivo': 'Ese módulo no está disponible.',
};

export function RouteNotice() {
  const searchParams = useSearchParams();
  const aviso = searchParams.get('aviso');
  const mensaje = aviso ? AVISOS[aviso] : null;

  if (!mensaje) return null;

  return (
    <p
      role="status"
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
    >
      {mensaje}
    </p>
  );
}
