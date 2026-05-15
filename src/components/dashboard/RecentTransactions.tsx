
import React from "react";
import { format } from "date-fns";
import { MoreVertical, ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

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

// Emoji map for category icons inside soft rounded containers
const categoryConfig: Record<string, { emoji: string; bg: string; dark: string }> = {
  Makanan:       { emoji: "🍔", bg: "bg-orange-50",  dark: "dark:bg-orange-900/20" },
  Transportasi:  { emoji: "🚗", bg: "bg-blue-50",    dark: "dark:bg-blue-900/20" },
  Hiburan:       { emoji: "🎮", bg: "bg-violet-50",  dark: "dark:bg-violet-900/20" },
  Belanja:       { emoji: "🛍️", bg: "bg-pink-50",    dark: "dark:bg-pink-900/20" },
  Kesehatan:     { emoji: "🏥", bg: "bg-emerald-50", dark: "dark:bg-emerald-900/20" },
  Tagihan:       { emoji: "💸", bg: "bg-rose-50",    dark: "dark:bg-rose-900/20" },
  Pendidikan:    { emoji: "📚", bg: "bg-indigo-50",  dark: "dark:bg-indigo-900/20" },
  Investasi:     { emoji: "📈", bg: "bg-teal-50",    dark: "dark:bg-teal-900/20" },
  Gaji:          { emoji: "💰", bg: "bg-emerald-50", dark: "dark:bg-emerald-900/20" },
  Lainnya:       { emoji: "✨", bg: "bg-gray-50",    dark: "dark:bg-gray-900/20" },
};

function getCategory(name: string) {
  return categoryConfig[name] ?? { emoji: "✨", bg: "bg-gray-50", dark: "dark:bg-gray-900/20" };
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const displayData = transactions.slice(0, 10);

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-2xl border border-gray-100 dark:border-white/10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-4">
        <div>
          <h3 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            Transaksi Terakhir
          </h3>
          <p className="mt-0.5 text-[13px] text-[#86868b] font-medium">
            Aktivitas keuangan terbaru
          </p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-[13px] font-bold text-[#007AFF] hover:opacity-70 transition-opacity"
        >
          Lihat semua
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-100/60 dark:divide-white/5">
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
            <span className="text-4xl">🧾</span>
            <p className="text-sm text-[#86868b] font-medium text-center">
              Belum ada transaksi terbaru.<br />Mulai catat pengeluaran pertamamu!
            </p>
          </div>
        ) : (
          displayData.map((tx) => {
            const cat = getCategory(tx.category);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between px-6 md:px-8 py-4 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* LEFT: Icon + Name/Category */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Soft rounded icon container — Apple HIG w-12 h-12 minimum touch area */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${cat.bg} ${cat.dark}`}
                  >
                    {cat.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px] text-gray-900 dark:text-white tracking-tight truncate">
                      {tx.name || "—"}
                    </p>
                    <p className="text-[12px] text-[#86868b] font-medium">
                      {tx.category || "Lainnya"}
                    </p>
                  </div>
                </div>

                {/* RIGHT: Amount + Date + Menu */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right hidden sm:block">
                    <p
                      className={`font-bold text-[14px] tracking-tight ${
                        tx.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </p>
                    <p className="text-[11px] text-[#86868b] font-medium">
                      {format(new Date(tx.date), "dd MMM yyyy")}
                    </p>
                  </div>

                  {/* Mobile: amount only */}
                  <div className="text-right sm:hidden">
                    <p
                      className={`font-bold text-[14px] tracking-tight ${
                        tx.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </p>
                    <p className="text-[11px] text-[#86868b] font-medium">
                      {format(new Date(tx.date), "dd MMM")}
                    </p>
                  </div>

                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-[#86868b] min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      {displayData.length > 0 && (
        <div className="px-6 md:px-8 py-4 border-t border-gray-100/60 dark:border-white/5">
          <Link
            href="/transactions"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Lihat semua transaksi
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
