"use client";

import { useUserPrefs } from "@/components/prefs/UserPrefContext";
import { cn, formatCurrency } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";
import { Target } from "lucide-react";
import Link from "next/link";

type BudgetProgress = {
  category: string;
  spent: number;
  limit: number;
};

function getBarColor(pct: number) {
  if (pct >= 100) return "bg-rose-500 animate-pulse";
  if (pct >= 70) return "bg-amber-400";
  return "bg-emerald-500";
}

function getBadgeStyle(pct: number): string {
  if (pct >= 100) return "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
  if (pct >= 70) return "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
}

export default function BudgetTracker({ items }: { items: BudgetProgress[] }) {
  const { currency, t } = useUserPrefs();
  if (items.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-sm shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
              Budget Tracker
            </h3>
            <p className="text-[13px] text-[#86868b] font-medium tracking-tight">
              Pengeluaran vs batas bulanan
            </p>
          </div>
        </div>
        <Link
          href="/settings/budget"
          className="text-[13px] font-bold text-[#007AFF] hover:opacity-70 transition-opacity tracking-tight"
        >
          Kelola →
        </Link>
      </div>

      {/* Budget Items — Apple Health style segmented bars */}
      <div className="space-y-6">
        {items.map((item) => {
          const pct = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;
          const clampedPct = Math.min(pct, 100);
          const remaining = Math.max(0, item.limit - item.spent);

          return (
            <div key={item.category}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight">
                  {getCategoryLabel(item.category)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#86868b] tracking-tight hidden sm:block">
                    {formatCurrency(item.spent, currency)} / {formatCurrency(item.limit, currency)}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2.5 py-0.5 rounded-full",
                      getBadgeStyle(pct)
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    getBarColor(pct),
                    pct < 100 && "shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                  )}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>

              {/* Remaining note */}
              {pct < 100 && (
                <p className="text-[11px] text-[#86868b] font-medium mt-1">
                  Sisa {formatCurrency(remaining, currency)}
                </p>
              )}
              {pct >= 100 && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">
                  ⚠ Batas terlampaui {formatCurrency(item.spent - item.limit, currency)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
