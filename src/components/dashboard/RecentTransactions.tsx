"use client";

import React from "react";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
  date: Date;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, string> = {
  Makanan: "🍔",
  Transportasi: "🚗",
  Hiburan: "🎮",
  Belanja: "🛍️",
  Kesehatan: "🏥",
  Tagihan: "💸",
  Pendidikan: "📚",
  Investasi: "📈",
  Gaji: "💰",
  Lainnya: "✨",
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Take top 5 for "Recent" if needed, but we'll show what's passed
  const displayData = transactions.slice(0, 10);

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
      <div className="p-8 border-b border-gray-100/50">
        <h3 className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Transaksi Terakhir</h3>
        <p className="mt-0.5 text-[13px] text-[#86868b] font-medium tracking-tight">Ringkasan aktivitas keuangan terbaru</p>
      </div>
      
      <div className="divide-y divide-gray-100/50">
        {displayData.map((tx, index) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-6 bg-transparent hover:bg-black/[0.02] transition-colors"
          >
            {/* LEFT CONTENT */}
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center text-2xl mr-4 bg-[#F5F5F7] rounded-[14px]">
                {categoryIcons[tx.category] || "✨"}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-[#1D1D1F] text-[15px] mb-0.5 tracking-tight">{tx.name}</p>
                <p className="text-[12px] text-[#86868b] font-semibold tracking-tight">{tx.category}</p>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center">
              <p className="text-[12px] text-[#86868b] font-semibold whitespace-nowrap mr-6 tracking-tight">
                {format(new Date(tx.date), "dd MMM yyyy")}
              </p>
              <div className="flex items-center gap-4">
                <p className={`font-bold text-[15px] tracking-tight ${tx.type === 'debit' ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                  {tx.type === 'debit' ? '-' : '+'}{formatRupiah(tx.amount)}
                </p>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#86868b]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {displayData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Belum ada transaksi terbaru.
          </div>
        )}
      </div>
    </div>
  );
}
