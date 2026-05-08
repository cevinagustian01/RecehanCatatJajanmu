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

  const getColor = (cat: string) => {
    const colors = [
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
      "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    ];
    const idx = cat.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColor(category.category)}`}>
            <span className="text-lg">{category.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {category.category}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isOver ? "Over budget" : `${Math.round(percentage)}% used`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            title="Edit budget"
          >
            <span className="text-sm font-medium">✏️</span>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Delete budget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <CategoryProgressBar spent={category.spent} limit={category.limit} />
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${isOver ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
            {formatRupiah(category.spent)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            / {formatRupiah(category.limit)}
          </p>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add Custom Category
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix, Spotify, Gym"
              className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Icon (Emoji)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["🎯", "🍔", "🚗", "💳", "🎮", "🛍️", "🏠", "📱", "❤️", "⚡", "🔥", "✨", "🎵", "📺", "🎬", "💼"].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Or paste any emoji"
              className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all border-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving…" : "Save"}
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
      {/* Toast (Top-right) */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] w-[320px] transform transition-all duration-300 ${
            toastShown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white dark:bg-slate-900 ${
              toast.type === "success"
                ? "border-emerald-200 text-emerald-700"
                : "border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${toast.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {toast.type === "success" ? "✅" : "❌"}
              </div>
              <div className="text-sm font-medium">{toast.message}</div>
            </div>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Budget
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your spending limits
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 border-none whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Set New Budget
        </button>
      </div>

      {/* Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-100" />
            <span className="text-sm font-medium text-emerald-100 uppercase tracking-wider">
              Budget Overview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-emerald-100 mb-1">Total Monthly Budget</p>
              <p className="text-3xl font-bold">{formatRupiah(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100 mb-1">Total Spent</p>
              <p className="text-3xl font-bold">{formatRupiah(totalSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100 mb-1">Remaining</p>
              <p className="text-3xl font-bold">{formatRupiah(remaining)}</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-100">Overall Usage</span>
              <span className="text-sm font-bold">{Math.round(overallPercentage)}%</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-700 ${
                  overallPercentage >= 100
                    ? "bg-red-400"
                    : overallPercentage >= 80
                    ? "bg-amber-400"
                    : "bg-white"
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Categories Breakdown
          </h2>
        </div>

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No budgets set yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Start tracking your spending by setting up budgets for different categories.
            </p>
            <button
              onClick={openAdd}
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Budget" : "Set New Budget"}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">KATEGORI</label>
            <CategoryDropdown
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categories.map(cat => ({ value: cat.name, label: `${cat.icon} ${cat.name}` }))}
              placeholder="Select a category"
              showAddCustom={true}
              onAddCustom={onAddCategory}
            />
          </div>

          {/* Monthly Limit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Limit
            </label>
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
              className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCategoryId}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all border-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        {/* Add Category Trigger */}
        {!initialData && selectedCategoryId === "__add_new__" && (
          <div className="px-6 pb-6">
            <button
              onClick={onAddCategory}
              className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + Add Custom Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
