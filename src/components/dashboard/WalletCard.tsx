"use client";

import { TrendingUp, ArrowUpRight, Zap, Wallet } from "lucide-react";
import { useBalanceVisibility } from "@/components/dashboard/BalanceVisibilityContext";
import { formatRupiah } from "@/lib/utils";

export default function WalletCard({ totalBalance = 0, income = 0, expenses = 0 }: { totalBalance?: number; income?: number; expenses?: number }) {
  const { showBalance } = useBalanceVisibility();

  // Simple calculation for the progress bar (placeholder limit of 10M for visualization)
  const spentPct = Math.min(100, expenses > 0 ? (expenses / 10000000) * 100 : 0);

  return (
    <div className="space-y-5">
      {/* Stats row - Unified Highlight Frame (Apple Minimalist Theme) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 text-slate-900 relative shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] border border-white/40 mb-8 overflow-hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* TOP SECTION (Status & Title) */}
        <div className="flex items-center gap-1.5 text-[11px] tracking-tight text-[#86868b] font-semibold uppercase mb-4 relative z-10">
          <Zap className="w-3.5 h-3.5 text-[#06C167]" />
          <span>SEKILAS HARI INI</span>
        </div>

        {/* Center Sections Container */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative">
          
          {/* CENTER LEFT (Main Balance) */}
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 break-words overflow-hidden">
                {showBalance ? formatRupiah(totalBalance) : "Rp •••••••"}
              </h2>
              <div className="bg-[#F5F5F7] p-2.5 rounded-[16px] text-gray-900 shadow-sm border border-gray-100">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[13px] text-[#86868b] mt-2 flex items-center gap-1 font-medium">
              <span className="text-[#06C167]">⚡</span> budget harian yang tersisa
            </p>
          </div>

          {/* CENTER RIGHT (Secondary Stats) */}
          <div className="mt-6 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 flex flex-wrap gap-x-10 gap-y-4 md:flex-col md:gap-5 md:text-right relative z-10">
            <div className="min-w-[100px]">
              <p className="text-[11px] text-[#86868b] uppercase mb-1 tracking-tight font-bold">Pemasukan</p>
              <p className="text-[#06C167] text-lg sm:text-2xl font-bold tracking-tight">
                {showBalance ? formatRupiah(income) : "Rp •••••••"}
              </p>
            </div>
            <div className="min-w-[100px]">
              <p className="text-[11px] text-[#86868b] uppercase mb-1 tracking-tight font-bold">Pengeluaran</p>
              <p className="text-gray-900 text-lg sm:text-2xl font-bold tracking-tight">
                {showBalance ? formatRupiah(expenses) : "Rp •••••••"}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION (Progress Bar) */}
        <div className="bg-[#F5F5F7] h-[8px] rounded-full w-full mt-10 relative overflow-hidden z-10 border border-gray-100">
          <div 
            className="bg-[#06C167] h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,193,103,0.3)]" 
            style={{ width: `${spentPct || 45}%` }}
          />
        </div>
      </div>

    </div>
  );
}
