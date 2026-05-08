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

export default function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
        <p className="text-sm text-slate-500 font-medium">Belum ada data pengeluaran.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm flex flex-col">
      <div>
        <h3 className="text-base font-bold text-slate-900">Pengeluaran per Kategori</h3>
        <p className="mt-0.5 text-sm text-slate-500">Distribusi pengeluaran dari seluruh transaksi</p>
      </div>

      <div className="mt-6 flex-1 h-[300px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
