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
      <div className="rounded-[8px] bg-white px-4 py-3 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] border-none">
        <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="mt-1 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-semibold text-slate-700">{formatRupiah(entry.value)}</span>
            <span className="text-xs text-slate-400 capitalize">{entry.dataKey}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Cashflow Overview</h3>
          <p className="mt-0.5 text-[13px] text-[#86868b] font-medium tracking-tight">
            {period === "yearly" ? "This Year" : period === "monthly" ? "This Month" : "Last 7 Days"}
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-[#F5F5F7] p-1.5 border border-gray-100">
          {(["weekly", "monthly", "yearly"] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-5 py-2 text-[12px] font-bold capitalize transition-all duration-300 tracking-tight ${
                period === p
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "text-[#86868b] hover:text-[#1D1D1F]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 h-[300px] lg:h-[450px] aspect-auto min-w-[300px]" style={{ minWidth: 0, minHeight: 0 }}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data} barGap={6} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E5E7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                interval="preserveStartEnd"
                minTickGap={10} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: "#86868B", fontSize: 11, fontWeight: 600 }}
                tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
              <Legend iconType="circle" iconSize={10}
                wrapperStyle={{ paddingTop: "24px", fontSize: "13px", fontWeight: 600, color: "#1D1D1F" }} />
              <Bar dataKey="income" fill="#007AFF" radius={[10, 10, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#E5E5E7" radius={[10, 10, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
