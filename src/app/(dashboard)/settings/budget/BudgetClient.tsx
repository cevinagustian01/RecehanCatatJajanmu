"use client";

import { useState } from "react";
import { upsertBudget, deleteBudget } from "@/actions/budget-actions";
import { formatRupiah } from "@/lib/utils";
import { Plus, Trash2, Loader2, Target, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";

type BudgetItem = {
  id: string;
  categoryId: string;
  category: string; // display label
  limitAmount: number;
  period: string;
  icon?: string | null;
};

export default function BudgetClient({ initialBudgets }: { initialBudgets: BudgetItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryIdOrName, setCategoryIdOrName] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryIdOrName.trim() || !limitAmount) return;
    setLoading(true);

    // upsertBudget expects `categoryId` (it can also accept a category name)
    const res = await upsertBudget({
      categoryId: categoryIdOrName.trim(),
      limitAmount: parseInt(limitAmount.replace(/[^0-9]/g, "")) || 0,
    });

    setLoading(false);
    if (res.success) {
      setCategoryIdOrName("");
      setLimitAmount("");
      setIsAddOpen(false);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus budget limit ini?")) return;
    setLoading(true);
    const res = await deleteBudget(id);
    setLoading(false);
    if (res.success) router.refresh();
    else alert(res.message);
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budget Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Set spending limits for each category to control your finances.</p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 w-full justify-center md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Budget Limit
        </button>
      </div>

      {initialBudgets.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-900">No budget limits set</h3>
          <p className="mt-1 text-sm text-slate-500">Add your first budget limit to start tracking spending per category.</p>
          <button onClick={() => setIsAddOpen(true)} className="mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            + Add Budget Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialBudgets.map(b => (
            <div key={b.id} className="group relative rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm transition-all hover:shadow-md hover:ring-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-inner">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{getCategoryLabel(b.category)}</h3>
                    <p className="text-xs text-slate-500 capitalize">{b.period}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)} 
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spending Limit</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatRupiah(b.limitAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">New Budget Limit</h2>
              <button onClick={() => setIsAddOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                <select
                  value={categoryIdOrName} onChange={(e) => setCategoryIdOrName(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES
                    .filter((c) => !initialBudgets.some((b) => b.category === c.value))
                    .map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Limit Amount (Rp)</label>
                <input 
                  type="number" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} required
                  placeholder="e.g., 2000000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-70 mt-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Budget Limit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
