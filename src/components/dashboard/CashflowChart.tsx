"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const data = [
  { month: "Jan", income: 4200, expenses: 2800 },
  { month: "Feb", income: 3800, expenses: 3200 },
  { month: "Mar", income: 5100, expenses: 2900 },
  { month: "Apr", income: 4600, expenses: 3400 },
  { month: "May", income: 5800, expenses: 3100 },
  { month: "Jun", income: 4900, expenses: 3600 },
  { month: "Jul", income: 6200, expenses: 3300 },
];

type Period = "weekly" | "monthly" | "yearly";

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
      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-200/50">
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

export default function CashflowChart() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Cashflow Overview</h3>
          <p className="mt-0.5 text-sm text-slate-500">Income vs Expenses</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
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
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc", radius: 8 }} />
            <Legend iconType="circle" iconSize={8}
              wrapperStyle={{ paddingTop: "16px", fontSize: "12px", fontWeight: 500 }} />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
