import type { ReactNode } from 'react';
import { PlataformaShell } from '@/components/plataforma/PlataformaShell';

export default function PlataformaPanelLayout({ children }: { children: ReactNode }) {
  return <PlataformaShell>{children}</PlataformaShell>;
}
