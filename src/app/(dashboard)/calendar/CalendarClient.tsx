"use client";

import { useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRupiah, cn } from "@/lib/utils";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  date: Date;
};

export default function CalendarClient({ 
  initialTransactions, 
  currentMonth, 
  currentYear 
}: { 
  initialTransactions: any[], 
  currentMonth: number, 
  currentYear: number 
}) {
  const router = useRouter();
  const date = new Date(currentYear, currentMonth);

  const days = useMemo(() => {
    // We want Monday as start of week
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [date]);

  const dailyData = useMemo(() => {
    const data: Record<string, { income: number; expense: number; total: number }> = {};
    initialTransactions.forEach(tx => {
      const dayKey = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!data[dayKey]) data[dayKey] = { income: 0, expense: 0, total: 0 };
      
      const amount = Number(tx.amount);
      if (tx.type === 'credit') { // income
        data[dayKey].income += amount;
      } else { // expense
        data[dayKey].expense += amount;
      }
      data[dayKey].total += amount;
    });
    return data;
  }, [initialTransactions]);

  const totalMonthlySpending = useMemo(() => {
    return Object.values(dailyData).reduce((sum, val) => sum + val.expense, 0);
  }, [dailyData]);

  const highestAbsNet = useMemo(() => {
    const values = Object.values(dailyData).map(d => Math.abs(d.income - d.expense));
    return values.length > 0 ? Math.max(...values) : 0;
  }, [dailyData]);

  const daysInMonth = endOfMonth(date).getDate();
  const monthlyAverage = totalMonthlySpending / daysInMonth;

  const navigateMonth = (step: number) => {
    const newDate = step > 0 ? addMonths(date, 1) : subMonths(date, 1);
    router.push(`/calendar?month=${newDate.getMonth()}&year=${newDate.getFullYear()}`);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kalender Pengeluaran</h1>
          <p className="text-sm text-[#86868b] mt-1 font-medium tracking-tight">Lihat distribusi belanja harian Anda</p>
        </div>

        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-sm self-start">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-sm font-bold text-gray-900 min-w-[140px] text-center capitalize">
            {format(date, 'MMMM yyyy', { locale: id })}
          </div>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-xl rounded-[32px] p-4 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] border border-white/20 overflow-x-auto no-scrollbar">
        <div className="min-w-[320px] sm:min-w-0">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-gray-100/50 pb-3 sm:pb-4 mb-3 sm:mb-4">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
              <div key={day} className="text-center">
                <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l border-t border-gray-100/50">
            {days.map((day, idx) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayData = dailyData[dayKey] || { income: 0, expense: 0, total: 0 };
              const isCurrentMonth = isSameMonth(day, date);
              
              const netAmount = dayData.income - dayData.expense;
              const absNet = Math.abs(netAmount);
              const intensity = highestAbsNet > 0 ? absNet / highestAbsNet : 0;
              
              const isProfit = netAmount > 0;
              const isLoss = netAmount < 0;
              const hasTransactions = dayData.total > 0;
              
              const rawPercentage = monthlyAverage > 0 ? (dayData.expense / monthlyAverage) * 100 : 0;
              const displayPercentage = rawPercentage > 999 ? ">999" : Math.round(rawPercentage).toString();

              return (
                <div 
                  key={dayKey} 
                  className={cn(
                    "relative p-1 sm:p-2.5 flex flex-col justify-between transition-all duration-500 group",
                    "min-h-[60px] sm:min-h-[90px]",
                    !isCurrentMonth ? "bg-gray-50/20 opacity-30" : "hover:z-20",
                    !hasTransactions && isCurrentMonth ? "border-r border-b border-gray-50" : "border-none"
                  )}
                >
                  {/* Heatmap Layer */}
                  {hasTransactions && isCurrentMonth && netAmount !== 0 && (
                    <div 
                      className={cn(
                        "absolute inset-0.5 sm:inset-1 rounded-lg sm:rounded-[24px] transition-all duration-700 shadow-sm border border-black/5",
                        isProfit ? (
                          intensity > 0.9 ? "bg-[#059669]" :
                          intensity > 0.6 ? "bg-[#10B981]" :
                          intensity > 0.3 ? "bg-[#6EE7B7]" : "bg-[#D1FAE5]"
                        ) : (
                          intensity > 0.9 ? "bg-[#E11D48]" :
                          intensity > 0.6 ? "bg-[#F43F5E]" :
                          intensity > 0.3 ? "bg-[#FDA4AF]" : "bg-[#FFE4E6]"
                        )
                      )}
                    />
                  )}

                  <span className={cn(
                    "relative z-10 text-[9px] sm:text-xs font-bold transition-colors duration-300",
                    isSameDay(day, new Date()) && !hasTransactions ? "text-emerald-600" : 
                    hasTransactions && intensity > 0.6 ? "text-white" : 
                    hasTransactions && intensity > 0 ? "text-gray-900" : "text-gray-400"
                  )}>
                    {format(day, 'd')}
                  </span>

                  {hasTransactions && isCurrentMonth && (
                    <div className="relative z-10 flex flex-col gap-0.5 animate-in fade-in zoom-in duration-300">
                      <p className={cn(
                        "font-bold text-[7px] sm:text-[11px] truncate leading-tight transition-colors duration-300",
                        intensity > 0.6 ? "text-white" : "text-gray-900"
                      )}>
                        {formatRupiah(dayData.total).replace(",00", "").replace("Rp", "Rp ")}
                      </p>
                      <div className={cn(
                        "text-[6px] sm:text-[8px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full self-start shadow-sm border transition-colors duration-300 hidden sm:block",
                        intensity > 0.6 
                          ? "bg-white/20 text-white border-white/20" 
                          : isLoss 
                            ? "bg-red-50 text-red-600 border-red-100" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {displayPercentage}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 animate-in fade-in duration-1000">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-[#10B981] shadow-sm border border-black/5" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lebih banyak Pemasukan</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-[#F43F5E] shadow-sm border border-black/5" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lebih banyak Pengeluaran</p>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-[24px] border border-white/20 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Belanja Bulan Ini</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">{formatRupiah(totalMonthlySpending)}</p>
          </div>
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-[24px] border border-white/20 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-rata Pengeluaran Harian</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">{formatRupiah(monthlyAverage)}</p>
          </div>
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-[24px] border border-white/20 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
               <CalendarIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 tracking-tight">Kesehatan Finansial</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Analisis harian aktif</p>
            </div>
          </div>
      </div>
    </div>
  );
}
