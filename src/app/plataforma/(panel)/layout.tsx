import type { ReactNode } from 'react';
import 'sweetalert2/dist/sweetalert2.min.css';
import { PlataformaShell } from '@/components/plataforma/PlataformaShell';

export default function PlataformaPanelLayout({ children }: { children: ReactNode }) {
  return <PlataformaShell>{children}</PlataformaShell>;
}
