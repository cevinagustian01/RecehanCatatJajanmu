export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import CategoryPieChart from "@/components/analytics/CategoryPieChart";
import { formatRupiah } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";

export const revalidate = 60;

const COLORS = ['#007AFF', '#34C759', '#FF9F0A', '#FF453A', '#BF5AF2', '#FF2D55', '#5856D6', '#64D2FF'];

export default async function AnalyticsPage() {
  const expenses = await prisma.transaction.findMany({
    where: {
      type: { in: ['EXPENSE', 'expense', 'Expense'] }
    },
    include: {
      category: true
    }
  });

  const groupedMap = expenses.reduce((acc, tx) => {
    const categoryName = tx.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = chartData.reduce((sum, item) => sum + item.amount, 0);

  const allIncome = await prisma.transaction.findMany({
    where: { type: { in: ['INCOME', 'income', 'Income'] } },
  });
  const totalIncome = allIncome.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-[28px] md:text-[32px] font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-[15px] text-[#86868b] font-medium tracking-tight mt-1">
          Analisis pengeluaran dan ringkasan finansial
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">Total</span>
          </div>
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Pemasukan</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full shrink-0">{chartData.length} kategori</span>
          </div>
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Pengeluaran</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[20px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">
              {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}%` : '-'}
            </span>
          </div>
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Rasio</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
            {totalIncome > 0 ? `${Math.round((1 - totalExpense / totalIncome) * 100)}%` : '0%'}
            <span className="text-[13px] font-medium text-[#86868b] ml-1">tersisa</span>
          </p>
        </div>
      </div>

      {/* MAIN CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut Chart */}
        <div className="lg:col-span-3">
          <CategoryPieChart data={chartData} />
        </div>

        {/* Category Details */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-6">Detail Kategori</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
            {chartData.length > 0 ? chartData.map((item, i) => {
              const percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
              return (
                <div key={item.category} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-gray-900">{formatRupiah(item.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ backgroundColor: COLORS[i % COLORS.length], width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#86868b] min-w-[32px] text-right">{percentage}%</span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <ArrowUpRight className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-[13px] font-semibold text-[#86868b]">Belum ada rincian</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
