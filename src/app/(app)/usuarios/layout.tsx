import type { ReactNode } from 'react';
import { RequireRole } from '@/components/auth';

export default function UsuariosLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="ADMIN">{children}</RequireRole>;
}
