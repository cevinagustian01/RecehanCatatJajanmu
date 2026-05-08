import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { BalanceVisibilityProvider } from "@/components/dashboard/BalanceVisibilityContext";
import BottomNav from "@/components/dashboard/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { currentUser } from "@clerk/nextjs/server"; // Note: Kalau di masa depan ada error import, ganti jadi "@clerk/nextjs/server"
import { syncUser } from "@/lib/sync-user";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  title: "FinFlow — Financial Dashboard",
  description:
    "Modern financial dashboard for managing wallets, tracking cashflow, and monitoring transactions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Catat Jajanmu",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  
  if (user) {
    const email = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress || "";
    await syncUser(user.id, email);
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} min-h-full bg-slate-50 text-slate-900 font-sans pb-[72px] md:pb-0 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300`} suppressHydrationWarning>
          <ThemeProvider>
            <SidebarProvider>
              <BalanceVisibilityProvider>
                {children}
                <BottomNav />
              </BalanceVisibilityProvider>
            </SidebarProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}