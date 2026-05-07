import { formatRupiah } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";
import { Target } from "lucide-react";
import Link from "next/link";

type BudgetProgress = {
  category: string;
  spent: number;
  limit: number;
};

function getBarColor(pct: number) {
  if (pct >= 100) return "bg-red-500 animate-pulse";
  if (pct >= 70)  return "bg-amber-500";
  return "bg-emerald-500";
}

function getBadgeColor(pct: number) {
  if (pct >= 100) return "bg-red-100 text-red-700";
  if (pct >= 70)  return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function BudgetTracker({ items }: { items: BudgetProgress[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-inner">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Budget Tracker</h3>
            <p className="text-xs text-slate-500">Monthly spending vs limits</p>
          </div>
        </div>
        <Link 
          href="/settings/budget" 
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Manage →
        </Link>
      </div>

      <div className="space-y-5">
        {items.map(item => {
          const pct = item.limit > 0 ? Math.round((item.spent / item.limit) * 100) : 0;
          const clampedPct = Math.min(pct, 100);

          return (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">{getCategoryLabel(item.category)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {formatRupiah(item.spent)} / {formatRupiah(item.limit)}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${getBadgeColor(pct)}`}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(pct)}`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
