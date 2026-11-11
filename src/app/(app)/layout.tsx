import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SuscripcionProvider } from "@/context/SuscripcionContext";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SuscripcionProvider>
      <RequireAuth>
        <AppLayout>{children}</AppLayout>
      </RequireAuth>
    </SuscripcionProvider>
  );
}
