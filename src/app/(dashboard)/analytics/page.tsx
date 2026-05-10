import prisma from "@/lib/prisma";
import CategoryPieChart from "@/components/analytics/CategoryPieChart";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Fetch all expenses with category relation
  const expenses = await prisma.transaction.findMany({
    where: {
      type: { in: ['EXPENSE', 'expense', 'Expense'] }
    },
    include: {
      category: true
    }
  });

  // Group by category name using JavaScript
  const groupedMap = expenses.reduce((acc, tx) => {
    const categoryName = tx.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for charts
  const chartData = Object.entries(groupedMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Analisis pengeluaran dan ringkasan finansial</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Component */}
        <div className="lg:col-span-2">
          <CategoryPieChart data={chartData} />
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 mb-6">Detail Kategori</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {chartData.length > 0 ? chartData.map((item, i) => {
              const percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
              return (
                <div key={item.category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i % 8] }} />
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{item.category}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                     <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{percentage}%</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500">Belum ada rincian data.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
