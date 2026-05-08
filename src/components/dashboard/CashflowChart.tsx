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
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Cashflow Overview</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {period === "yearly" ? "This Year" : period === "monthly" ? "This Month" : "Last 7 Days"}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["weekly", "monthly", "yearly"] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                period === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[280px]" style={{ minWidth: 0, minHeight: 0 }}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 2, fill: 'transparent', strokeDasharray: '4 4' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ paddingTop: "16px", fontSize: "12px", fontWeight: 500 }} />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
