"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  History, 
  Plus, 
  Sparkles, 
  MoreHorizontal, 
  X, 
  ChartBar, 
  Target,
  Calendar, 
  User, 
  Download, 
  HelpCircle,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import AddTransactionModal from "./AddTransactionModal";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Jangan tampilkan di halaman auth
  const isAuthPage = pathname.includes('/login') || pathname.includes('/sign-in') || pathname.includes('/sign-up');
  if (isAuthPage) return null;

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: History, label: "Riwayat", href: "/transactions" },
    { icon: null, label: "Add", href: null }, // Center button
    { icon: Sparkles, label: "AI Chat", href: "/ai-chat" },
    { icon: MoreHorizontal, label: "Lainnya", href: null }, // Drawer trigger
  ];

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 sm:px-6 pb-[env(safe-area-inset-bottom,16px)] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] md:hidden">
        <div className="flex items-center justify-between max-w-lg mx-auto gap-0 sm:gap-0">
          {navItems.map((item, i) => {
            if (item.label === "Add") {
              return (
                <div key={i} className="relative -mt-10">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-[6px] ring-white transition-all active:scale-90"
                  >
                    <Plus className="h-7 w-7 stroke-[2.5px]" />
                  </button>
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = item.href
              ? item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/")
              : (item.label === "Lainnya" && isMoreOpen);
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href;
                  } else if (item.label === "Lainnya") {
                    setIsMoreOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 max-w-[64px] transition-all active:scale-90"
              >
                <div className={cn(
                  "p-1 rounded-xl transition-colors",
                  isActive ? item.label === "AI Chat" ? "text-blue-500" : "text-emerald-600" : "text-gray-400"
                )}>
                  <Icon className={cn("h-6 w-6 stroke-[1.5px]", isActive && "stroke-[2px]")} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight",
                  isActive ? item.label === "AI Chat" ? "text-blue-500" : "text-emerald-600" : "text-gray-400"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={cn("absolute bottom-1 w-1 h-1 rounded-full", item.label === "AI Chat" ? "bg-blue-500" : "bg-emerald-600")} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* "Lainnya" Action Sheet (Drawer) */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-white rounded-t-[40px] px-8 pb-[env(safe-area-inset-bottom,32px)] pt-4 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out border-t border-white/20">
            {/* Grabber Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Menu Lainnya</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Akses cepat fitur Domptt</p>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: ChartBar, label: "Laporan Keuangan", href: "/transactions", color: "bg-blue-50 text-blue-600" },
                { icon: Target, label: "Budget", href: "/budget", color: "bg-blue-50 text-blue-600" },
                { icon: Calendar, label: "Kalender", href: "/calendar", color: "bg-emerald-50 text-emerald-600" },
                { icon: User, label: "Profil & Akun", href: "/profile", color: "bg-purple-50 text-purple-600" },
                { icon: Download, label: "Export Data", href: "#", color: "bg-amber-50 text-amber-600" },
                { icon: HelpCircle, label: "Pusat Bantuan", href: "#", color: "bg-gray-100 text-gray-600" },
              ].map((menu, i) => (
                <Link
                  key={i}
                  href={menu.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center justify-between p-4 rounded-[24px] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90", menu.color)}>
                      <menu.icon className="w-6 h-6 stroke-[1.5px]" />
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">{menu.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </Link>
              ))}
            </div>

            {/* Destructive: Logout */}
            <button
              onClick={() => {
                setIsMoreOpen(false);
                signOut();
              }}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] border border-red-100 dark:border-red-900/30 rounded-2xl mt-6 shadow-sm active:scale-[0.98] transition-transform group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 transition-colors group-hover:bg-red-100">
                  <LogOut className="w-6 h-6 stroke-[1.5px]" />
                </div>
                <span className="font-bold text-red-600 dark:text-red-500 tracking-tight">Keluar Akun</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300" />
            </button>
          </div>
        </div>
      )}

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
