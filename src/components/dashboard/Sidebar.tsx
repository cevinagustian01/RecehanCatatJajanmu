"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ChartBar,
  Settings,
  HelpCircle,
  LogOut,
  Target,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Wallet, label: "My Wallet", href: "/wallet" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  { icon: ChartBar, label: "Analytics", href: "/analytics" },
  { icon: Target, label: "Budget", href: "/budget" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:flex md:h-screen md:w-[260px] md:flex-col md:border-r md:border-slate-100 md:bg-white dark:md:border-slate-800 dark:md:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            FinFlow
          </h1>
          <p className="text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Finance Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400 dark:shadow-none"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-300"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <HelpCircle className="h-4 w-4" />
          </div>
          Help Center
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
            <LogOut className="h-4 w-4" />
          </div>
          Log Out
        </button>
      </div>
      </aside>
    </>
  );
}
