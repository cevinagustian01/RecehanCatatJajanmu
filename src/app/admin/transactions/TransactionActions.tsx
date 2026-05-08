"use client";

import { useState } from "react";
import { deleteTransaction } from "../actions";
import { toast } from "sonner";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TransactionActions({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction globally?")) return;
    
    setLoading(true);
    const res = await deleteTransaction(transactionId);
    if (res.success) {
      toast.success("Transaction deleted successfully!");
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    // We could open the AddTransactionModal in edit mode, 
    // but for admin purposes, navigating to a detail page or opening a specific modal works.
    // For now we'll just show a toast that this is a placeholder.
    toast.info("Edit feature for Admin will open a modal soon.");
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={handleEdit}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
        title="Edit Transaction"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
      </button>
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        title="Delete Transaction"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
