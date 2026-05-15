"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryData {
  category: string;
  amount: number;
}

const COLORS = ['#007AFF', '#34C759', '#FF9F0A', '#FF453A', '#BF5AF2', '#FF2D55', '#5856D6', '#64D2FF', '#30D158', '#FFD60A'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-2xl border border-gray-100/50 rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: payload[0].color }} />
          <p className="text-[13px] font-bold text-gray-900">{data.category}</p>
        </div>
        <p className="text-[15px] font-bold text-gray-900 tracking-tight">{formatRupiah(data.amount)}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data, hideContainer = false, title = "Spending Breakdown", subtitle = "Distribusi pengeluaran" }: {
  data: CategoryData[];
  hideContainer?: boolean;
  title?: string;
  subtitle?: string;
}) {
  if (!data || data.length === 0) {
    const emptyState = (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
            <PieChartIcon className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-[13px] font-semibold text-[#86868b]">Belum ada data</p>
          <p className="text-[11px] text-gray-400 font-medium">Transaksi akan muncul di sini</p>
        </div>
      </div>
    );
    if (hideContainer) return emptyState;
    return (
      <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="h-[300px]">{emptyState}</div>
      </div>
    );
  }

  const content = (
    <div className="flex-1 w-full" style={{ minHeight: 280, height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={115}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
            stroke="none"
            cornerRadius={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="outline-none transition-all duration-300"
              />
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

  const header = title ? (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
          <PieChartIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#86868b] font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="bg-gray-100/80 px-3 py-1.5 rounded-full">
        <p className="text-[11px] font-bold text-gray-600">{data.length} kategori</p>
      </div>
    </div>
  ) : null;

  if (hideContainer) return content;

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-gray-100/80 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col">
      {header}
      {content}
    </div>
  );
}
