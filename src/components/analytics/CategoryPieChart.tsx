"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatRupiah } from "@/lib/utils";

interface CategoryData {
  category: string;
  amount: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="flex flex-col items-center justify-center border-none bg-transparent p-2 shadow-none">
        <p className="text-sm font-semibold text-slate-500 drop-shadow-sm">{data.category}</p>
        <p className="text-lg font-bold text-slate-900 mt-1 drop-shadow-sm">{formatRupiah(data.amount)}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data, hideContainer = false }: { data: CategoryData[], hideContainer?: boolean }) {
  if (!data || data.length === 0) {
    if (hideContainer) return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No Data Available</p>
      </div>
    );
    return (
      <div className="flex h-[350px] items-center justify-center bg-white/50 backdrop-blur-md border border-white/20 rounded-[24px] shadow-sm">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No Data Available</p>
      </div>
    );
  }

  const content = (
    <div className="flex-1 h-[300px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={4}
            dataKey="amount"
            nameKey="category"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'transparent' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (hideContainer) return content;

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] flex flex-col">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Spending Breakdown</h3>
        <p className="mt-1 text-xs text-gray-400 font-bold uppercase tracking-widest">Distribusi pengeluaran saat ini</p>
      </div>
      {content}
    </div>
  );
}
