import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthProvider } from "@/context/AuthContext";
import { StockAlertProvider } from "@/context/StockAlertContext";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-screen bg-zinc-100 text-zinc-900">
        <AuthProvider>
          <StockAlertProvider>{children}</StockAlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
