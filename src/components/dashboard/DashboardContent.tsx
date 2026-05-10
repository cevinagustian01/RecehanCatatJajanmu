"use client";

import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import CashflowChart from "./CashflowChart";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface WalletData {
  id: string;
  wallet_name: string;
  balance: number;
}

interface TransactionData {
  id: string;
  type: string;
  amount: number;
  merchant: string | null;
  category: { name: string | null } | null;
  created_at: Date;
}

interface DashboardContentProps {
  totalBalance: number;
  income: number;
  expenses: number;
  recentTransactions: TransactionData[];
  wallets: WalletData[];
}

export default function DashboardContent({ 
  totalBalance, 
  income, 
  expenses, 
  recentTransactions,
  wallets 
}: DashboardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6">
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card 1: Account Balance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Balance</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">+12.5%</span>
            </div>
            <div className="flex items-end gap-2 pt-2 pb-4">
              <span className="text-4xl font-bold text-gray-900">Rp {totalBalance.toLocaleString()}</span>
              <span className="text-xs text-gray-400 mb-3">vs last month</span>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-3 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors">
                <ArrowUpRight className="w-5 h-5" />
                Request Money
              </button>
            </div>
          </div>

          {/* Card 2: My Wallet */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">My Wallet</span>
              <Link href="/wallet" className="text-xs text-emerald-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {wallets.slice(0, 4).map((w) => (
                 <div key={w.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between hover:border-emerald-200 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Wallet className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 truncate">{w.wallet_name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 truncate">Rp {w.balance.toLocaleString()}</span>
                 </div>
               ))}
               {/* Placeholder for empty slots to maintain 2x2 grid */}
               {[...Array(Math.max(0, 4 - wallets.length))].map((_, i) => (
                 <div key={`empty-${i}`} className="bg-gray-50 p-4 rounded-xl border border-gray-100 border-dashed flex items-center justify-center text-gray-300">
                    <Plus className="w-5 h-5" />
                 </div>
               ))}
            </div>
          </div>

          {/* Card 3: My Savings Plan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">My Savings Plan</span>
              <PiggyBank className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="h-32 flex items-center justify-center border border-gray-100 rounded-xl bg-gray-50">
               <span className="text-gray-400 text-sm">[Savings Placeholder]</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Top Row: Income & Expense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Income</span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-900 mb-1">Rp {income.toLocaleString()}</span>
              <span className="text-xs text-gray-400">This period</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Expense</span>
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <span className="text-3xl font-bold text-red-500 mb-1">Rp {expenses.toLocaleString()}</span>
              <span className="text-xs text-gray-400">This period</span>
            </div>
          </div>

{/* Middle Row: Overview Chart */}
          <CashflowChart />

          {/* Bottom Row: Recent Transactions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Link href="/transactions" className="text-sm text-emerald-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                      <span>{tx.merchant?.[0] || '?'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.merchant}</p>
                      <p className="text-xs text-gray-500">{tx.category?.name ?? "Uncategorized"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-semibold ${String(tx.type).toUpperCase() === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {String(tx.type).toUpperCase() === 'INCOME' ? '+' : '-'}Rp {tx.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-6">No transactions yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
