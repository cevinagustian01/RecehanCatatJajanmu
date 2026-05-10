import { formatRupiah } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/categories";
import { Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-black text-white shadow-lg">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Budget Tracker</h3>
            <p className="text-[13px] text-[#86868b] font-medium tracking-tight">Monthly spending vs limits</p>
          </div>
        </div>
        <Link 
          href="/settings/budget" 
          className="text-[13px] font-bold text-[#007AFF] hover:underline transition-all tracking-tight"
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold text-[#1D1D1F] tracking-tight">{getCategoryLabel(item.category)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-[#86868b] tracking-tight">
                    {formatRupiah(item.spent)} / {formatRupiah(item.limit)}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    pct >= 100 ? "bg-[#FF3B30] text-white" : "bg-[#34C759] text-white"
                  )}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-[8px] w-full rounded-full bg-[#F5F5F7] overflow-hidden border border-gray-100/50">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    pct >= 100 ? "bg-[#FF3B30]" : "bg-[#34C759] shadow-[0_0_10px_rgba(52,199,89,0.3)]"
                  )}
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
