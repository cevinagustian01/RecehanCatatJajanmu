import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import BottomNav from "@/components/dashboard/BottomNav";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { BalanceVisibilityProvider } from "@/components/dashboard/BalanceVisibilityContext";
import { UserPrefProvider } from "@/components/prefs/UserPrefContext";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialCurrency = "IDR";
  let initialLocale: Locale = "id";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const localUser = await prisma.user.findFirst({
        where: { auth_user_id: user.id },
        select: { currency: true, language: true },
      });
      if (localUser) {
        initialCurrency = localUser.currency?.toUpperCase() || "IDR";
        initialLocale = (localUser.language as Locale) || "id";
      }
    }
  } catch {
    // fallback
  }

  return (
    <AuthProvider>
      <UserPrefProvider initialCurrency={initialCurrency} initialLocale={initialLocale}>
      <SidebarProvider>
        <BalanceVisibilityProvider>
          <div className="flex h-screen bg-[#FBFBFD] dark:bg-black selection:bg-[#007AFF]/30 selection:text-black">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-[260px] w-full max-w-full overflow-hidden">
              <Header />
              <main className="flex-1 px-3 sm:px-4 py-4 pb-32 md:px-8 md:py-8 md:pb-12 lg:px-12 lg:py-10 overflow-y-auto w-full max-w-full overflow-x-hidden">
                <div className="max-w-6xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
            <BottomNav />
          </div>
        </BalanceVisibilityProvider>
      </SidebarProvider>
      </UserPrefProvider>
    </AuthProvider>
  );
}
