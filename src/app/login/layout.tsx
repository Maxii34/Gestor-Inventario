import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Ingresar',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
