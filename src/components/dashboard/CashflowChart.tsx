"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchChartData, ChartPeriod } from "@/app/actions/transactions";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-2xl border border-gray-100/50 rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] min-w-[180px]">
        <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-3">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 mt-1.5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[13px] font-semibold text-[#86868b] capitalize">{entry.dataKey}</span>
            </div>
            <span className="text-[13px] font-bold text-gray-900">{formatRupiah(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  weekly: "Minggu",
  monthly: "Bulan",
  yearly: "Tahun",
};

export default function CashflowChart({ initialData }: { initialData?: ChartDataPoint[] }) {
  const [period, setPeriod] = useState<ChartPeriod>("monthly");
  const [data, setData] = useState<ChartDataPoint[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const loadData = useCallback(async (chartPeriod: ChartPeriod) => {
    setIsLoading(true);
    try {
      const result = await fetchChartData(chartPeriod);
      setData(result);
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 transition-all duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Cashflow</h3>
          </div>
          <p className="text-[13px] text-[#86868b] font-medium tracking-tight ml-0.5">
            Ringkasan arus kas {PERIOD_LABELS[period]}an
          </p>
        </div>

        {/* Period Pills */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-full self-start">
          {(["weekly", "monthly", "yearly"] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 tracking-tight ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-[#86868b] hover:text-gray-900"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* STATS ROW - Attention: big numbers */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-8 pb-6 border-b border-gray-100/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Pemasukan</p>
              <p className="text-[15px] sm:text-[17px] font-bold text-gray-900 tracking-tight truncate">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-100 shrink-0" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Pengeluaran</p>
              <p className="text-[15px] sm:text-[17px] font-bold text-gray-900 tracking-tight truncate">{formatRupiah(totalExpenses)}</p>
            </div>
          </div>
        </div>
      )}

      {/* CHART AREA */}
      <div className="h-[240px] md:h-[280px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-black animate-spin" />
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Memuat data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-[13px] font-semibold text-[#86868b]">Belum ada data cashflow</p>
            <p className="text-[11px] text-gray-400 font-medium">Mulai catat transaksi untuk melihat grafik</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barGap={6}
              barCategoryGap="25%"
              onMouseMove={(state: any) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setHoveredBar(data[state.activeTooltipIndex]?.name || null);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Bar
                dataKey="income"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Income"
                maxBarSize={32}
              />
              <Bar
                dataKey="expenses"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                name="Expenses"
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
