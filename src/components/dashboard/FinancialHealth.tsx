"use client";

import { useUserPrefs } from "@/components/prefs/UserPrefContext";
import { formatCurrency } from "@/lib/utils";

interface FinancialHealthProps {
  income: number;
  expenses: number;
}

export default function FinancialHealth({ income, expenses }: FinancialHealthProps) {
    const { currency, t } = useUserPrefs();
    let pct = 0;
    if (income > 0) {
      pct = ((income - expenses) / income) * 100;
    } else if (expenses > 0) {
      pct = -100;
    }

    const clampedPct = Math.max(0, Math.min(100, pct + 50)); // 0–100 visual scale

    let statusText = "Moderat";
    let statusEmoji = "😐";
    let statusBar = "bg-amber-400";
    let statusBadge = "bg-amber-50 text-amber-600";
    let statusDesc = "Cashflow bulan ini seimbang";

    if (pct > 50) {
      statusText = "Sehat";
      statusEmoji = "😊";
      statusBar = "bg-emerald-500";
      statusBadge = "bg-emerald-50 text-emerald-600";
      statusDesc = "Keuangan sangat sehat 🎉";
    } else if (pct > 10) {
      statusText = "Moderat";
      statusEmoji = "😐";
    } else {
      statusText = "Kritis";
      statusEmoji = "😟";
      statusBar = "bg-rose-500";
      statusBadge = "bg-rose-50 text-rose-600";
      statusDesc = "Perlu evaluasi pengeluaran";
    }

    const percentage = pct;
    const status = statusText;
    const emoji = statusEmoji;
    const barColor = statusBar;
    const badgeClass = statusBadge;
    const description = statusDesc;

  const formattedPct =
    percentage > 0
      ? `+${percentage.toFixed(1).replace(".", ",")}%`
      : `${percentage.toFixed(1).replace(".", ",")}%`;

  const net = income - expenses;

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col gap-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            Kesehatan Cashflow
          </h3>
          <p className="text-[13px] text-[#86868b] font-medium mt-0.5">Status bulan ini</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${badgeClass}`}>
          {status}
        </span>
      </div>

      {/* Status + percentage */}
      <div className="flex items-center gap-4">
        <div className="text-5xl leading-none">{emoji}</div>
        <div>
          <p className={`text-3xl font-bold tracking-tighter ${percentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
            {formattedPct}
          </p>
          <p className="text-[12px] text-[#86868b] font-medium mt-0.5">{description}</p>
        </div>
      </div>

      {/* Apple Health-style segmented bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-[#86868b] uppercase tracking-tight">
          <span>Pengeluaran</span>
          <span>Pemasukan</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{
              width: `${income > 0 ? Math.min(100, Math.round((expenses / income) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Net cashflow */}
      <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
        <span className="text-[13px] font-semibold text-[#86868b]">Net Cashflow</span>
        <span className={`text-[14px] font-bold tracking-tight ${net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
          {net >= 0 ? "+" : ""}{formatCurrency(net, currency)}
        </span>
      </div>
    </div>
  );
}
