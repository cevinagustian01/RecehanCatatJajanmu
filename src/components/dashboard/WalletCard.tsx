"use client";

import { TrendingUp, TrendingDown, Eye, EyeOff, Zap } from "lucide-react";
import { useBalanceVisibility } from "@/components/dashboard/BalanceVisibilityContext";
import { formatRupiah } from "@/lib/utils";

export default function WalletCard({
  totalBalance = 0,
  income = 0,
  expenses = 0,
}: {
  totalBalance?: number;
  income?: number;
  expenses?: number;
}) {
  const { showBalance, toggleBalance } = useBalanceVisibility();

  const savingsRate =
    income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;
  const spentPct = income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0;

  return (
    /* ── ATTENTION Hero Card ── */
    <div className="relative overflow-hidden rounded-[28px] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">

      {/* Soft Pastel Mesh Gradient Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-100/30 dark:bg-violet-900/10 blur-2xl" />
      </div>

      <div className="relative z-10">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868b]">
              Sekilas Hari Ini
            </span>
          </div>
          <button
            onClick={toggleBalance}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-[#86868b]"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Balance — MASSIVE typography */}
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900 dark:text-white leading-none">
            {showBalance ? formatRupiah(totalBalance) : "Rp •••••••"}
          </h1>
          <p className="mt-2 text-sm text-[#86868b] font-medium">Total saldo semua dompet</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:flex md:gap-10">
          {/* Income */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-[#86868b]">Pemasukan</p>
              <p className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {showBalance ? formatRupiah(income) : "Rp •••••"}
              </p>
            </div>
          </div>

          {/* Expenses */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 shrink-0">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-[#86868b]">Pengeluaran</p>
              <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {showBalance ? formatRupiah(expenses) : "Rp •••••"}
              </p>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 shrink-0">
              <span className="text-base">📊</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-[#86868b]">Simpanan</p>
              <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Apple Health-style segmented progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-tight">
              Cashflow bulan ini
            </span>
            <span className="text-[11px] font-bold text-[#86868b]">
              {spentPct}% digunakan
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                spentPct >= 100
                  ? "bg-rose-500 animate-pulse"
                  : spentPct >= 75
                  ? "bg-amber-400"
                  : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              }`}
              style={{ width: `${spentPct || 2}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
