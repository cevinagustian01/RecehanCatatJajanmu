"use client";

import { Edit2, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteTransaction } from "@/app/actions/transactions";
import { useRouter } from "next/navigation";
import AddTransactionModal, { TransactionData } from "@/components/dashboard/AddTransactionModal";

export default function TransactionActions({ tx }: { tx: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Yakin mau hapus transaksi ini? Saldo dompet akan dihitung ulang.")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteTransaction(tx.id);
      if (!res.success) {
        alert(res.message);
      } else {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus transaksi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const initialData: TransactionData = {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    merchant: tx.merchant || tx.name,
    wallet: tx.wallet?.wallet_name || tx.wallet
  };

  return (
    <>
      <div className="flex items-center gap-1 justify-end">
        <button 
          onClick={() => setIsEditOpen(true)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
          title="Edit Transaksi"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none disabled:opacity-50"
          title="Hapus Transaksi"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
      
      <AddTransactionModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        initialData={initialData} 
      />
    </>
  );
}
