import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import BottomNav from "@/components/dashboard/BottomNav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinFlow — Financial Dashboard",
  description:
    "Modern financial dashboard for managing wallets, tracking cashflow, and monitoring transactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans pb-[72px] md:pb-0">
        <SidebarProvider>
          {children}
          <BottomNav />
        </SidebarProvider>
      </body>
    </html>
  );
}
