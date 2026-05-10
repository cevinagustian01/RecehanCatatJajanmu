"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Trash2, 
  X, 
  Wallet 
} from "lucide-react";
import CategoryDropdown from "@/components/CategoryDropdown";
import { getBudgetsWithSpent, deleteBudget, upsertBudget } from "@/actions/budget-actions";
import { getCategories } from "@/actions/category-actions";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  type?: string | null;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getProgressColor(percentage: number) {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 80) return "bg-amber-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
}

function CategoryProgressBar({ spent, limit }: { spent: number; limit: number }) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const color = getProgressColor(percentage);

  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className={`absolute left-0 top-0 h-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function CategoryCard({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: Budget; 
  onEdit: (cat: Budget) => void; 
  onDelete: (id: string) => void;
}) {
  const percentage = category.limit > 0 ? (category.spent / category.limit) * 100 : 0;
  const isOver = percentage >= 100;

  return (
    <div className="group bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[24px] p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner border border-white">
            <span className="text-xl">{category.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 tracking-tight">
              {category.category}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
              {isOver ? "Over budget" : `${Math.round(percentage)}% used`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-xl text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
            title="Edit budget"
          >
            <span className="text-sm font-medium">✏️</span>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete budget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-xl font-black tracking-tight ${isOver ? "text-red-600" : "text-gray-900"}`}>
              {formatRupiah(category.spent)}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Limit: {formatRupiah(category.limit)}
            </p>
          </div>
          <span className={cn(
            "text-[11px] font-black px-2 py-0.5 rounded-full",
            isOver ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
          )}>
            {Math.round(percentage)}%
          </span>
        </div>

        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
          <div
            className={cn(
              "absolute left-0 top-0 h-full transition-all duration-700",
              isOver ? "bg-red-500" : percentage > 80 ? "bg-amber-400" : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AddCategoryModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onSave({ name: name.trim(), icon });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-md mx-auto border border-white p-8 animate-in zoom-in duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Custom Kategori</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Buat kategori pengeluaran baru</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nama Kategori</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix, Gym, Hobbi"
              className="w-full h-12 px-5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Icon (Emoji)</label>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {["🎯", "🍔", "🚗", "💳", "🎮", "🛍️", "🏠", "📱", "❤️", "⚡", "🔥", "✨", "🎵", "📺", "🎬", "💼"].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90 shadow-sm border",
                    icon === emoji
                      ? "bg-white border-emerald-500 shadow-emerald-100 ring-2 ring-emerald-500/20"
                      : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Atau tempel emoji di sini"
              className="w-full h-12 px-5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-bold focus:border-emerald-500 transition-all outline-none"
              maxLength={2}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl border border-gray-100 text-gray-500 hover:bg-gray-50 font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-black text-white font-bold shadow-lg hover:opacity-80 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetManager({ 
  initialBudgets = [], 
  initialCategories = [] 
}: { 
  initialBudgets?: Budget[]; 
  initialCategories?: Category[]; 
}) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

   const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [toastShown, setToastShown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setToastShown(true);
    window.setTimeout(() => setToastShown(false), 1800);
  };

  // Combine default categories with custom user categories, deduped by name
  const availableCategories = useMemo(() => {
    const defaultsWithId: Category[] = DEFAULT_CATEGORIES.map(c => ({
      id: `default-${c.name.toLowerCase()}`,
      name: c.name,
      icon: c.icon,
      type: "EXPENSE",
    }));

    const normalizedUserCats: Category[] = categories.map((c) => ({
      ...c,
      type: c.type ?? undefined,
    }));

    const combined = [...defaultsWithId, ...normalizedUserCats];
    const uniqueMap = new Map<string, Category>();
    combined.forEach((cat) => {
      if (!uniqueMap.has(cat.name)) uniqueMap.set(cat.name, cat);
    });
    return Array.from(uniqueMap.values());
  }, [categories]);

  const fetchBudgets = async () => {
    const data = await getBudgetsWithSpent();
    setBudgets(data);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    // Load initial data from server
    fetchBudgets();
    fetchCategories();
  }, []);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    setIsSubmitting(true);
    const res = await deleteBudget(id);
    setIsSubmitting(false);
    if (res.success) {
      await fetchBudgets();
    } else {
      alert(res.message);
    }
  };

  const handleSave = async (data: { categoryId: string; limitAmount: number; icon: string }) => {
    setIsSubmitting(true);
    const payload = {
      id: editingBudget?.id,
      categoryId: data.categoryId,
      limitAmount: data.limitAmount,
      icon: data.icon,
    };
    const res = await upsertBudget(payload);
    setIsSubmitting(false);

    if (res.success) {
      // Refresh numbers first, then show success overlay and close after 1s
      await fetchBudgets();
      showToast("success", "Mantap! Budget berhasil dipasang 🎯");
      window.setTimeout(() => {
        setIsModalOpen(false);
        setEditingBudget(null);
      }, 1000);
    } else {
      showToast("error", res.message || "Failed to save budget");
    }
  };

  const handleAddCategory = async (data: { name: string; icon: string }) => {
    // We'll need a separate server action for adding categories
    // For now, we'll call the category action via a separate function
    // This will be implemented in the modal component
  };

  const openAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification (Hydration Protected) */}
      {isMounted && toastShown && toast && (
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-500"
        >
          <div
            className={cn(
              "rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur-xl bg-white/90",
              toast.type === "success" ? "border-emerald-100 text-emerald-900" : "border-red-100 text-red-900"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                toast.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {toast.type === "success" ? "✓" : "!"}
              </div>
              <div className="text-[13px] font-bold tracking-tight">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Monthly Budget
          </h1>
          <p className="text-sm text-[#86868b] mt-1 font-medium">
            Manage your monthly spending limits and financial goals
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-black text-sm font-bold text-white shadow-md hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Set New Budget
        </button>
      </div>

      {/* Overview Card (Apple Glass Style) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:scale-110">
          <Wallet className="w-32 h-32 text-gray-900" />
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Total Monthly Budget</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">{formatRupiah(totalBudget)}</p>
            </div>
            <div className="space-y-1 md:border-l border-gray-100 md:pl-12">
              <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Total Spent</p>
              <p className={cn(
                "text-4xl font-black tracking-tight",
                overallPercentage >= 100 ? "text-red-600" : "text-gray-900"
              )}>
                {formatRupiah(totalSpent)}
              </p>
            </div>
            <div className="space-y-1 md:border-l border-gray-100 md:pl-12">
              <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Remaining</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">{formatRupiah(remaining)}</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#86868b] uppercase tracking-widest">Overall Usage</span>
              <span className={cn(
                "text-sm font-black px-3 py-1 rounded-full",
                overallPercentage >= 100 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {Math.round(overallPercentage)}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div
                className={cn(
                  "absolute left-0 top-0 h-full transition-all duration-1000 ease-out",
                  overallPercentage >= 100 ? "bg-red-500" : overallPercentage >= 80 ? "bg-amber-400" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-8 ml-1">
          Categories Breakdown
        </h2>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-gray-100 bg-white/50 p-20 text-center animate-in fade-in duration-1000">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 shadow-inner">
              <Wallet className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              No budgets set yet
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xs font-medium">
              Start tracking your spending by setting up monthly limits for different categories.
            </p>
            <button
              onClick={openAdd}
              className="mt-8 px-8 py-3 rounded-full bg-black text-sm font-bold text-white hover:opacity-80 transition-all shadow-lg active:scale-95"
            >
              Set Your First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <CategoryCard
                key={budget.id}
                category={budget}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Budget Modal */}
       <BudgetModal
         isOpen={isModalOpen}
         onClose={() => {
           setIsModalOpen(false);
           setEditingBudget(null);
         }}
         onSave={handleSave}
         initialData={editingBudget}
         categories={availableCategories}
         onAddCategory={() => setShowAddCategory(true)}
       />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={async (data) => {
          // This will call addCustomCategory from category-actions
          // We need to pass the function from parent, but for simplicity we'll call it directly
          const { addCustomCategory } = await import("@/actions/category-actions");
          const res = await addCustomCategory(data);
          if (res.success) {
            await fetchCategories();
            setShowAddCategory(false);
            // Auto-select the new category
            const newCat = categories.find(c => c.name.toLowerCase() === data.name.toLowerCase());
            if (newCat) {
              setEditingBudget(null);
              setIsModalOpen(true);
              // Pre-fill will happen when modal opens with editingBudget=null and we'll select this category
            }
          } else {
            alert(res.message);
          }
        }}
      />
    </div>
  );
}

function BudgetModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  onAddCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { categoryId: string; limitAmount: number; icon: string }) => Promise<void>;
  initialData?: Budget | null;
  categories: Category[];
  onAddCategory: () => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedCategoryId(initialData.category);
        setLimit(initialData.limit.toString());
        setIcon(initialData.icon);
      } else {
        setSelectedCategoryId("");
        setLimit("");
        setIcon("🎯");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !limit.trim() || !icon.trim()) return;

    const limitNum = parseInt(limit.replace(/[^0-9]/g, ""), 10) || 0;
    setIsSubmitting(true);
    await onSave({
      categoryId: selectedCategoryId,
      limitAmount: limitNum,
      icon: icon.trim(),
    });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl w-full max-w-md mx-auto border border-white p-8 animate-in zoom-in duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {initialData ? "Edit Budget" : "Set New Budget"}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tentukan batas pengeluaran bulanan</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">KATEGORI</label>
            <CategoryDropdown
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categories.map(cat => ({ value: cat.name, label: `${cat.icon} ${cat.name}` }))}
              placeholder="Pilih kategori"
              showAddCustom={true}
              onAddCustom={onAddCategory}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Batas Bulanan (Limit)</label>
            <div className="relative">
              <input
                type="text"
                value={limit}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setLimit(val);
                }}
                onBlur={() => {
                  const num = parseInt(limit.replace(/[^0-9]/g, ""), 10) || 0;
                  setLimit(num.toLocaleString("id-ID"));
                }}
                placeholder="e.g. 5.000.000"
                className="w-full h-12 px-5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-2xl border border-gray-100 text-gray-500 hover:bg-gray-50 font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategoryId}
              className="flex-1 h-12 rounded-2xl bg-black text-white font-bold shadow-lg hover:opacity-80 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan…" : "Simpan Budget"}
            </button>
          </div>
        </form>

        {!initialData && selectedCategoryId === "__add_new__" && (
          <div className="mt-6 text-center">
            <button
              onClick={onAddCategory}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-bold"
            >
              + Tambah Kategori Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
