"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchChartData, ChartPeriod } from "@/app/actions/transactions";

interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] px-4 py-3 shadow-xl border border-gray-100 dark:border-white/10">
        <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{formatRupiah(entry.value)}</span>
            <span className="text-[11px] text-[#86868b] capitalize">{entry.dataKey}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export default function CashflowChart({ initialData }: { initialData?: ChartDataPoint[] }) {
  const [period, setPeriod] = useState<ChartPeriod>("monthly");
  const [data, setData] = useState<ChartDataPoint[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            Cashflow Overview
          </h3>
          <p className="mt-0.5 text-[13px] text-[#86868b] font-medium tracking-tight">
            {PERIOD_LABELS[period]}
          </p>
        </div>
        {/* Period pill tabs */}
        <div className="w-full max-w-full flex items-center overflow-x-auto scrollbar-hide bg-gray-100/80 dark:bg-white/5 p-1 rounded-full">
          {(["weekly", "monthly", "yearly"] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 whitespace-nowrap px-3 py-1.5 text-xs md:text-sm text-center rounded-full font-bold capitalize transition-all duration-200 tracking-tight min-h-[32px] ${
                period === p
                  ? "bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-sm"
                  : "text-[#86868b] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] md:h-[300px]" style={{ minWidth: 0 }}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="text-3xl">📊</span>
            <p className="text-sm text-[#86868b] font-medium">Belum ada data cashflow</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)", radius: 8 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px", fontWeight: 700, color: "#86868b" }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
