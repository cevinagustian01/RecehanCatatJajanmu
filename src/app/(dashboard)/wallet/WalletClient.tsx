"use client";

import { useState } from "react";
import { addWallet, updateWallet, deleteWallet } from "@/app/actions/wallets";
import { formatRupiah } from "@/lib/utils";
import { MoreVertical, Plus, Edit2, Trash2, Wallet as WalletIcon, X, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBalanceVisibility } from "@/components/dashboard/BalanceVisibilityContext";

type WalletData = { 
  id: string, 
  wallet_name: string, 
  balance: number,
  color?: string | null,
  cardNumber?: string | null,
  expiryDate?: string | null,
  cardHolder?: string | null,
  cardType?: string | null,
  type?: string | null,
  _count: { transactions: number } 
};

export default function WalletClient({ initialWallets }: { initialWallets: WalletData[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showBalance } = useBalanceVisibility();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  const openAdd = () => {
    setName("");
    setBalance("");
    setIsAddOpen(true);
  };

  const openEdit = (w: WalletData) => {
    setSelectedWallet(w);
    setName(w.wallet_name);
    setIsEditOpen(true);
  };

  const openDelete = (w: WalletData) => {
    setSelectedWallet(w);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const initialBal = parseInt((balance ?? "").toString().replace(/[^0-9]/g, ""), 10) || 0;
    const formData = { name, balance: initialBal };

    console.log("FORM DATA:", formData);
    const res = await addWallet(formData);

    setLoading(false);
    if (res.success) {
      setIsAddOpen(false);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedWallet) return;
    setLoading(true);
    
    const res = await updateWallet(selectedWallet.id, { name });
    
    setLoading(false);
    if (res.success) {
      setIsEditOpen(false);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedWallet) return;
    setLoading(true);
    
    const res = await deleteWallet(selectedWallet.id);
    
    setLoading(false);
    if (res.success) {
      setIsDeleteOpen(false);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallet Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your accounts, cards, and cash wallets.</p>
        </div>
        
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 w-full justify-center md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialWallets.map(w => (
          <div key={w.id} className="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm transition-all hover:shadow-md hover:ring-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner">
                  <WalletIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{w.wallet_name}</h3>
                  <p className="text-xs text-slate-500">{w._count.transactions} transactions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(w)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-emerald-600 focus:outline-none" title="Edit Wallet">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => openDelete(w)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none" title="Delete Wallet">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Balance</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                 {showBalance ? formatRupiah(w.balance) : "Rp •••••••"}
              </p>
            </div>
          </div>
        ))}

        {initialWallets.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <WalletIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No wallets found</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first wallet to start tracking finances.</p>
            <button onClick={openAdd} className="mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              + Add Wallet Now
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">New Wallet</h2>
              <button onClick={() => setIsAddOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Wallet Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="e.g., BCA, Cash, GoPay"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Initial Balance (Rp)</label>
                <input 
                  type="number" value={balance} onChange={(e) => setBalance(e.target.value)}
                  placeholder="e.g., 1000000 (Optional)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-70 mt-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Wallet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedWallet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Edit Wallet</h2>
              <button onClick={() => setIsEditOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Wallet Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-70 mt-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && selectedWallet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Delete Wallet?</h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete <span className="font-bold text-slate-800">{selectedWallet.wallet_name}</span>? 
              This will permanently delete all <b>{selectedWallet._count.transactions} transactions</b> associated with it. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleDeleteSubmit} disabled={loading} className="flex-1 flex justify-center items-center rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-70 shadow-lg shadow-red-200">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
