"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ChartBar,
  User as UserIcon,
  Calendar,
  HelpCircle,
  LogOut,
  Target,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserPrefs } from "@/components/prefs/UserPrefContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isOpen, setIsOpen } = useSidebar();
  const { t } = useUserPrefs();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/user/role").then(r => r.json()).then(d => setIsAdmin(d.role === "ADMIN")).catch(() => {});
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), href: "/dashboard" },
    { icon: Wallet, label: t("nav.wallet"), href: "/wallet" },
    { icon: Calendar, label: t("nav.calendar"), href: "/calendar" },
    { icon: ChartBar, label: t("nav.transactions"), href: "/transactions" },
    { icon: Sparkles, label: t("nav.aiChat"), href: "/ai-chat" },
    { icon: Target, label: t("nav.budget"), href: "/budget" },
    { icon: UserIcon, label: t("nav.profile"), href: "/profile", sublabel: "Kelola Akun" },
    ...(isAdmin ? [{ icon: Shield, label: t("nav.admin"), href: "/admin" }] : []),
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] transition-transform md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Logo/Branding */}
      <div className="px-6 py-8 flex items-center gap-3">
        <img 
          src="/logo-icon.png" 
          alt="Domptt Logo" 
          className="w-10 h-10 object-contain animate-in fade-in zoom-in duration-700"
        />
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Domptt
        </h1>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group mx-4 px-4 py-3 flex items-center gap-3 transition-all duration-200 font-medium text-sm rounded-2xl ${
                    isActive
                      ? "bg-white/80 shadow-sm text-emerald-600"
                      : "text-gray-500 hover:bg-white/50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={cn("h-5 w-5 stroke-[1.5px]", isActive ? "text-emerald-600" : item.label === "AI Chat" ? "text-gray-400 group-hover:text-blue-500" : "text-gray-400 group-hover:text-gray-900")} />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.sublabel && (
                      <span className="text-[10px] text-gray-400 font-normal leading-tight">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section - Floating Glass Card */}
      <div className="mt-auto p-4 mb-4">
        <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-[24px] p-2 shadow-sm">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white/80 hover:text-red-500 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 stroke-[1.5px]" />
            <span className="text-sm font-semibold tracking-tight">{t("nav.signOut")}</span>
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
