'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { MODULO_CLIENTES } from '@/lib/config';

export default function ClientesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!MODULO_CLIENTES) {
      router.replace('/dashboard?aviso=modulo-inactivo');
    }
  }, [router]);

  if (!MODULO_CLIENTES) return null;

  return <>{children}</>;
}
