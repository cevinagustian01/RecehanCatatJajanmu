"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWalletsList, addTransaction, updateTransactionDetails } from "@/app/actions/transactions";
import { X, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import CategoryDropdown from "@/components/CategoryDropdown";

export type TransactionData = {
  id: string;
  type: "credit" | "debit" | "INCOME" | "EXPENSE" | string;
  amount: number;
  category: string;
  merchant: string;
  wallet?: string;
  walletId?: string;
  date?: string | Date; // custom transaction date (maps to prisma.transaction.created_at)
};

export default function AddTransactionModal({ isOpen, onClose, initialData }: { isOpen: boolean, onClose: () => void, initialData?: TransactionData | null }) {
  const router = useRouter();
  const [wallets, setWallets] = useState<{id: string, name: string}[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [walletId, setWalletId] = useState("");
  const [transactionDate, setTransactionDate] = useState<string>(""); // YYYY-MM-DD (local)

  useEffect(() => {
    if (isOpen) {
      setWalletsLoading(true);
      getWalletsList().then(res => {
        setWallets(res);
        setWalletsLoading(false);
        if (initialData) {
          const wId = initialData.walletId || res.find(w => w.name === initialData.wallet)?.id;
          if (wId) setWalletId(wId);
        } else if (res.length > 0) {
          setWalletId(res[0].id);
        }
      }).catch(() => {
        setWalletsLoading(false);
      });
      
      if (initialData) {
        setType(initialData.type.toUpperCase() === "CREDIT" || initialData.type.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE");
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setMerchant(initialData.merchant);

        // Set custom date from tx created_at if available
        if (initialData.date) {
          try {
            const d = new Date(initialData.date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            setTransactionDate(`${yyyy}-${mm}-${dd}`);
          } catch {
            setTransactionDate("");
          }
        }
      } else {
        setType("EXPENSE");
        setAmount("");
        setCategory(CATEGORIES[0].value);
        setMerchant("");

        // Default to today
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setTransactionDate(`${yyyy}-${mm}-${dd}`);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''));
    
    if (!walletId || !numAmount || !category || !merchant) {
      toast.error("Semua field harus diisi");
      setIsSubmitting(false);
      return;
    }

    let res:
      | { success: boolean; message?: string }
      | undefined;

    if (initialData) {
      res = await updateTransactionDetails(initialData.id, {
        walletId,
        amount: numAmount,
        type,
        category,
        merchant,
        created_at: transactionDate, // map to prisma.transaction.created_at
      });
    } else {
      res = await addTransaction({
        walletId,
        amount: numAmount,
        type,
        category,
        merchant,
        created_at: transactionDate, // map to prisma.transaction.created_at
      });
    }

    if (!res) {
      toast.error("Waduh, gagal nyimpen transaksi nih.");
      setIsSubmitting(false);
      return;
    }

    if (res.success) {
      toast.success('Yeay, transaksi berhasil dicatat!');
      setAmount("");
      setCategory("");
      setMerchant("");
      router.refresh();
      onClose();
    } else {
      toast.error('Waduh, gagal nyimpen transaksi nih.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/80">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors dark:hover:bg-slate-800 dark:text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${type === "EXPENSE" ? "bg-white text-red-600 shadow-sm dark:bg-slate-700 dark:text-red-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${type === "INCOME" ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Kategori</label>
            <CategoryDropdown
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
              placeholder="Pilih kategori"
              showAddCustom={false}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Merchant / Catatan</label>
            <input 
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Contoh: Warteg, Kopi Kenangan"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Tanggal</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Dompet</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
              required
              disabled={walletsLoading}
            >
              {walletsLoading ? (
                <option value="" disabled>Loading wallets...</option>
              ) : wallets.length === 0 ? (
                <option value="" disabled>No wallets found. Create one first in My Wallet.</option>
              ) : (
                wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</span>
            ) : initialData ? "Simpan Perubahan" : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
