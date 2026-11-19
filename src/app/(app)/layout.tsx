import type { ReactNode } from "react";
import type { Metadata } from "next";
import "sweetalert2/dist/sweetalert2.min.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import { StockAlertProvider } from "@/context/StockAlertContext";
import { SuscripcionProvider } from "@/context/SuscripcionContext";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StockAlertProvider>
        <SuscripcionProvider>
          <RequireAuth>
            <AppLayout>{children}</AppLayout>
          </RequireAuth>
        </SuscripcionProvider>
      </StockAlertProvider>
    </AuthProvider>
  );
}
