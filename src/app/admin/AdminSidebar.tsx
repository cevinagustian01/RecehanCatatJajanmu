"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeftRight, Settings, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/admin/transactions" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white/70 backdrop-blur-xl border-r border-gray-100 flex flex-col shrink-0">
      <div className="px-6 py-8">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Domptt CMS</h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Admin Panel</p>
          </div>
        </Link>
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
  );
}
