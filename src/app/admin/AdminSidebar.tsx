"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeftRight, Settings, FileText, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/admin/transactions" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar({ isOpen = false, onClose = () => {} }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-white/95 backdrop-blur-xl border-r border-gray-100 flex flex-col transition-transform duration-300 md:static md:translate-x-0 md:w-64 md:bg-white/70",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-6 py-5 flex items-center justify-between gap-3 md:justify-start">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">Domptt CMS</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Admin Panel</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Menu</p>
        <ul className="space-y-1">
          {adminNav.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 stroke-[1.5px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 stroke-[1.5px]" />
          Back to App
        </Link>
      </div>
    </aside>
  </>
);
}
