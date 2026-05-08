"use client";

import { Wifi, Eye, EyeOff, TrendingUp, ArrowUpRight } from "lucide-react";
import { useBalanceVisibility } from "@/components/dashboard/BalanceVisibilityContext";
import { formatRupiah } from "@/lib/utils";

export default function WalletCard({ totalBalance = 0, income = 0, expenses = 0 }: { totalBalance?: number; income?: number; expenses?: number }) {
  const { showBalance, toggleBalance } = useBalanceVisibility();

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Balance</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {showBalance ? formatRupiah(totalBalance) : "Rp •••••••"}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">+12.5%</span>
            <span className="text-xs text-slate-400">vs last month</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {showBalance ? formatRupiah(income) : "Rp •••••••"}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">+8.2%</span>
            <span className="text-xs text-slate-400">vs last month</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
              <TrendingUp className="h-4 w-4 text-orange-500 rotate-180" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {showBalance ? formatRupiah(expenses) : "Rp •••••••"}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-red-500 rotate-90" />
            <span className="text-xs font-semibold text-red-500">-3.1%</span>
            <span className="text-xs text-slate-400">vs last month</span>
          </div>
        </div>
      </div>

      {/* Credit Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-6 text-white shadow-2xl shadow-emerald-200">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5 blur-xl" />
          <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-lg" />
          <svg className="absolute right-6 top-6 opacity-20" width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="40" cy="40" r="18" fill="none" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium tracking-wider text-emerald-100 uppercase">Primary Card</p>
              <p className="mt-0.5 text-sm font-medium text-white/80">Platinum Member</p>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 rotate-90 text-white/70" />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-emerald-100">Total Balance</p>
            <div className="flex items-center mt-1">
              <p className="text-3xl font-bold tracking-tight">
                {showBalance ? formatRupiah(totalBalance) : "Rp •••••••"}
              </p>
              <button 
                onClick={toggleBalance} 
                className="text-white/80 hover:text-white cursor-pointer w-5 h-5 ml-3 focus:outline-none transition-colors"
              >
                {showBalance ? <Eye className="w-full h-full" /> : <EyeOff className="w-full h-full" />}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-wider text-emerald-200 uppercase">Card Number</p>
              <p className="mt-1 text-sm font-medium tracking-widest">•••• •••• •••• 4829</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium tracking-wider text-emerald-200 uppercase">Expires</p>
              <p className="mt-1 text-sm font-medium">09/28</p>
            </div>
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded-full bg-white/30" />
              <div className="-ml-3 h-8 w-8 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
