"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, Plus, ChartBar, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";

export default function BottomNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] w-full items-center justify-between border-t border-slate-200 bg-white px-6 pb-2 pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 transition-colors hover:text-emerald-500 w-12">
          <Home className={`h-6 w-6 ${pathname === "/" ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`text-[10px] font-medium ${pathname === "/" ? "text-emerald-500" : "text-slate-400"}`}>Home</span>
        </Link>
        
        <Link href="/transactions" className="flex flex-col items-center justify-center gap-1 transition-colors hover:text-emerald-500 w-12">
          <ArrowLeftRight className={`h-6 w-6 ${pathname === "/transactions" ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`text-[10px] font-medium ${pathname === "/transactions" ? "text-emerald-500" : "text-slate-400"}`}>History</span>
        </Link>
        
        <div className="relative -mt-8 flex items-center justify-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-300 ring-[6px] ring-slate-50 transition-transform active:scale-95"
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>
        
        <Link href="/analytics" className="flex flex-col items-center justify-center gap-1 transition-colors hover:text-emerald-500 w-12">
          <ChartBar className={`h-6 w-6 ${pathname === "/analytics" ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`text-[10px] font-medium ${pathname === "/analytics" ? "text-emerald-500" : "text-slate-400"}`}>Analytics</span>
        </Link>
        
        <Link href="/settings/budget" className="flex flex-col items-center justify-center gap-1 transition-colors hover:text-emerald-500 w-12">
          <MoreHorizontal className={`h-6 w-6 ${pathname.startsWith("/settings") ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`text-[10px] font-medium ${pathname.startsWith("/settings") ? "text-emerald-500" : "text-slate-400"}`}>More</span>
        </Link>
      </nav>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
