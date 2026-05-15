import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { BalanceVisibilityProvider } from "@/components/dashboard/BalanceVisibilityContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Domptt - Catat Uangmu",
  description: "Apple Style Financial Tracker",
  manifest: "/manifest.json",
  applicationName: "Domptt",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Domptt",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-full bg-slate-50 text-slate-900 font-sans md:pb-0 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <BalanceVisibilityProvider>
                {children}
              </BalanceVisibilityProvider>
            </SidebarProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
