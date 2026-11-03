import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SuscripcionProvider } from "@/context/SuscripcionContext";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SuscripcionProvider>
      <RequireAuth>
        <AppLayout>{children}</AppLayout>
      </RequireAuth>
    </SuscripcionProvider>
  );
}
