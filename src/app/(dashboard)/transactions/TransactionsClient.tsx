"use client";

import { useState, useMemo } from "react";
import { useUserPrefs } from "@/components/prefs/UserPrefContext";
import { cn, formatCurrency } from "@/lib/utils";
import { Search as SearchIcon, Filter, LayoutGrid, List } from "lucide-react";
import TransactionActions from "@/components/transactions/TransactionActions";
import CategoryPieChart from "@/components/analytics/CategoryPieChart";

type Transaction = {
  id: string;
  merchant: string | null;
  amount: number;
  type: string;
  created_at: Date;
  category?: { name: string | null } | null;
  wallet?: { wallet_name: string; type?: string } | null;
};

export default function TransactionsClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const { currency, t } = useUserPrefs();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    let result = initialTransactions;

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((tx) => {
        const merchantMatch = tx.merchant?.toLowerCase().includes(lowerQuery);
        const categoryMatch = tx.category?.name?.toLowerCase().includes(lowerQuery);
        return merchantMatch || categoryMatch;
      });
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((tx) => String(tx.type).toUpperCase() === typeFilter);
    }

    // Filter by time (Exact Date)
    if (timeFilter !== "all" && timeFilter !== "") {
      result = result.filter((tx) => {
        const txDate = new Date(tx.created_at);
        const filterDate = new Date(timeFilter);
        return (
          txDate.getDate() === filterDate.getDate() &&
          txDate.getMonth() === filterDate.getMonth() &&
          txDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    // Filter by wallet
    if (walletFilter !== "all") {
      result = result.filter((tx) => tx.wallet?.wallet_name === walletFilter);
    }

    return result;
  }, [initialTransactions, searchQuery, typeFilter, timeFilter, walletFilter]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      const dateKey = new Date(curr.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(curr);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  // Extract unique wallets for the dropdown
  const walletEntries = Array.from(
    initialTransactions.reduce((map, tx) => {
      if (tx.wallet?.wallet_name) {
        if (!map.has(tx.wallet.wallet_name)) {
          map.set(tx.wallet.wallet_name, { name: tx.wallet.wallet_name, type: tx.wallet?.type });
        }
      }
      return map;
    }, new Map<string, { name: string; type?: string }>())
  ).map(([_, entry]) => entry);

  // Calculate Chart Data dynamically
  const chartData = useMemo(() => {
    const expenses = filteredTransactions.filter(tx => String(tx.type).toUpperCase() === 'EXPENSE');
    const groupedMap = expenses.reduce((acc, tx) => {
      const categoryName = tx.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => chartData.reduce((sum, item) => sum + item.amount, 0), [chartData]);
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Keuangan</h1>
        <p className="text-sm text-[#86868b] mt-1 font-medium tracking-tight mb-8">Ringkasan transaksi dan analisis distribusi pengeluaran Anda</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all"
              placeholder="Cari transaksi atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <input
            type="date"
            value={timeFilter === "all" ? "" : timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-white/50 backdrop-blur-sm border border-gray-100 text-gray-600 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-black/5 transition-all"
          />

          <select
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="bg-white/50 backdrop-blur-sm border border-gray-100 text-gray-600 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-black/5 transition-all appearance-none"
          >
            <option value="all">💳 Semua Dompet</option>
            {walletEntries.map((w) => (
              <option key={w.name} value={w.name}>
                {w.name} ({w.type?.replace('_', ' ') || 'BANK'})
              </option>
            ))}
          </select>
        </div>

        {/* Analytics Section (Unified) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
          {/* Donut Chart */}
          <div className="lg:col-span-7 bg-white/50 backdrop-blur-md rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Spending Breakdown</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Berdasarkan filter saat ini</p>
              </div>
              <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                 <p className="text-xs font-bold text-gray-900">{chartData.length} Kategori</p>
              </div>
            </div>
            <div className="h-[300px]">
              <CategoryPieChart data={chartData} hideContainer />
            </div>
          </div>

          {/* Category Details */}
          <div className="lg:col-span-5 bg-white/50 backdrop-blur-md rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] border border-white/20 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-8">Detail Pengeluaran</h3>
            <div className="space-y-5 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {chartData.length > 0 ? chartData.map((item, i) => {
                const percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
                return (
                  <div key={item.category} className="group flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-2.5 w-2.5 rounded-full ring-4 ring-white shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-bold text-gray-700 tracking-tight">{item.category}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
                          Rp {formatCurrency(item.amount, currency).replace("Rp", "").trim()}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md mt-1">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ backgroundColor: COLORS[i % COLORS.length], width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Filter className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada data</p>
                  <p className="text-xs text-gray-400 mt-1">Coba sesuaikan filter pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction List Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Daftar Transaksi</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{filteredTransactions.length} Rekaman Ditemukan</p>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/50 backdrop-blur-sm border border-gray-100 text-gray-600 rounded-full px-4 py-2 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-black/5 transition-all"
          >
            <option value="all">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
        </div>
      </div>

      <div>
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-md rounded-[24px] border border-dashed border-gray-200">
            <SearchIcon className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateKey) => (
            <div key={dateKey} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase mt-8 mb-4 tracking-widest">
                {dateKey}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[dateKey].map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[22px] p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:translate-x-1 transition-all duration-300 group"
                  >
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[18px] bg-gray-50 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        {transaction.category?.name?.toLowerCase().includes('food') ? '🍔' : 
                         transaction.category?.name?.toLowerCase().includes('transport') ? '🚗' : 
                         transaction.category?.name?.toLowerCase().includes('shopping') ? '🛍️' : '💰'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-[15px] tracking-tight mb-0.5">
                          {transaction.merchant || "Transaksi"}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                            {transaction.category?.name || "Uncategorized"}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                            {transaction.wallet?.wallet_name}
                          </p>
                          {transaction.wallet?.type && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              transaction.wallet.type === "BANK" ? "bg-blue-50 text-blue-600" :
                              transaction.wallet.type === "E_WALLET" ? "bg-emerald-50 text-emerald-600" :
                              "bg-amber-50 text-amber-600"
                            }`}>
                              {transaction.wallet.type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-6">
                      <p
                        className={`font-bold text-[16px] tracking-tight ${
                          String(transaction.type).toUpperCase() === "INCOME"
                            ? "text-emerald-500"
                            : "text-gray-900"
                        }`}
                      >
                        {String(transaction.type).toUpperCase() === "INCOME" ? "+" : "-"}Rp{" "}
                        {formatCurrency(transaction.amount, currency).replace("Rp", "").trim()}
                      </p>
                      <TransactionActions tx={transaction} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
