"use client";

import { useMemo } from "react";

interface FinancialHealthProps {
  income: number;
  expenses: number;
}

export default function FinancialHealth({ income, expenses }: FinancialHealthProps) {
  const { percentage, status, emoji, colorClass, description } = useMemo(() => {
    let pct = 0;
    if (income > 0) {
      pct = ((income - expenses) / income) * 100;
    } else if (expenses > 0) {
      pct = -100; // if no income but have expenses
    }

    let statusText = "Moderat";
    let statusEmoji = "😐";
    let statusColor = "text-emerald-500";
    let statusDesc = "Status: Rencana anda aman";

    if (pct > 50) {
      statusText = "Sehat";
      statusEmoji = "😊";
      statusDesc = "Status: Keuangan sangat sehat";
    } else if (pct > 10) {
      statusText = "Moderat";
      statusEmoji = "😐";
    } else {
      statusText = "Kritis";
      statusEmoji = "😟";
      statusColor = "text-red-500";
      statusDesc = "Status: Perlu evaluasi pengeluaran";
    }

    return {
      percentage: pct,
      status: statusText,
      emoji: statusEmoji,
      colorClass: statusColor,
      description: statusDesc,
    };
  }, [income, expenses]);

  const formattedPct = percentage > 0 
    ? `+${percentage.toFixed(1).replace('.', ',')}%`
    : `${percentage.toFixed(1).replace('.', ',')}%`;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col">
      <h3 className="text-[13px] font-semibold text-[#86868b] mb-4 uppercase tracking-tight">Kesehatan Cashflow</h3>
      <div className="flex items-center">
        <div className="text-6xl flex items-center justify-center mr-8">
          {emoji}
        </div>
        <div>
          <p className="text-xl font-bold text-[#1D1D1F] tracking-tight">{status}</p>
          <p className="text-[13px] text-[#86868b] mb-2 font-medium">Status bulan ini</p>
          <p className={`${percentage >= 0 ? 'text-[#06C167]' : 'text-[#FF3B30]'} text-3xl font-bold tracking-tight`}>{formattedPct}</p>
          <p className="text-[11px] text-[#86868b] mt-1 font-medium">{description}</p>
        </div>
      </div>
    </div>
  );
}
