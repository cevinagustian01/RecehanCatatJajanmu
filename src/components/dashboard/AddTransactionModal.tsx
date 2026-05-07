"use client";

import { useState, useEffect } from "react";
import { getWalletsList, addTransaction, updateTransactionDetails } from "@/app/actions/transactions";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export type TransactionData = {
  id: string;
  type: "credit" | "debit" | "INCOME" | "EXPENSE" | string;
  amount: number;
  category: string;
  merchant: string;
  wallet?: string;
  walletId?: string;
};

export default function AddTransactionModal({ isOpen, onClose, initialData }: { isOpen: boolean, onClose: () => void, initialData?: TransactionData | null }) {
  const router = useRouter();
  const [wallets, setWallets] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [walletId, setWalletId] = useState("");

  useEffect(() => {
    if (isOpen) {
      getWalletsList().then(res => {
        setWallets(res);
        if (initialData) {
          const wId = initialData.walletId || res.find(w => w.name === initialData.wallet)?.id;
          if (wId) setWalletId(wId);
        } else if (res.length > 0) {
          setWalletId(res[0].id);
        }
      });
      
      if (initialData) {
        setType(initialData.type.toUpperCase() === "CREDIT" || initialData.type.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE");
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setMerchant(initialData.merchant);
      } else {
        setType("EXPENSE");
        setAmount("");
        setCategory(CATEGORIES[0].value);
        setMerchant("");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    
    if (!walletId || !numAmount || !category || !merchant) {
      alert("Semua field harus diisi");
      setLoading(false);
      return;
    }

    let res;
    if (initialData) {
      res = await updateTransactionDetails(initialData.id, {
        walletId, amount: numAmount, type, category, merchant
      });
    } else {
      res = await addTransaction({
        walletId, amount: numAmount, type, category, merchant
      });
    }

    if (res.success) {
      setAmount("");
      setCategory("");
      setMerchant("");
      router.refresh();
      onClose();
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${type === "EXPENSE" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${type === "INCOME" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Nominal (Rp)</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 50000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Merchant / Catatan</label>
            <input 
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Contoh: Warteg, Kopi Kenangan"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Dompet</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              {wallets.length === 0 && <option value="">Loading wallets...</option>}
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : initialData ? "Simpan Perubahan" : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
