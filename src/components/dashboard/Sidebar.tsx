"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ChartBar,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Wallet, label: "My Wallet", href: "/wallet" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  { icon: ChartBar, label: "Analytics", href: "/analytics" },
  { icon: CreditCard, label: "Cards", href: "/cards" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            FinFlow
          </h1>
          <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Finance Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
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
      <div className="border-t border-slate-100 p-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <HelpCircle className="h-4 w-4" />
          </div>
          Help Center
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <LogOut className="h-4 w-4" />
          </div>
          Log Out
        </button>
      </div>
    </aside>
  );
}
