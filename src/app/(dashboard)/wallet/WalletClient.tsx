"use client";

import { useState } from "react";
import { addWallet, updateWallet, deleteWallet } from "@/app/actions/wallets";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2, Wallet as WalletIcon, X, Loader2, AlertTriangle, Smartphone, Banknote, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBalanceVisibility } from "@/components/dashboard/BalanceVisibilityContext";
import { useUserPrefs } from "@/components/prefs/UserPrefContext";
import { toast } from "sonner";

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
  const { currency } = useUserPrefs();
  const fmt = (n: number) => formatCurrency(n, currency);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [walletType, setWalletType] = useState("BANK");

  const walletTypeOptions = [
    { value: "BANK", label: "Bank", icon: Landmark, color: "bg-blue-50 text-blue-600" },
    { value: "E_WALLET", label: "E-Wallet", icon: Smartphone, color: "bg-emerald-50 text-emerald-600" },
    { value: "CASH", label: "Cash", icon: Banknote, color: "bg-amber-50 text-amber-600" },
  ];

  const typeIcons: Record<string, { icon: any; color: string }> = {
    BANK: { icon: Landmark, color: "bg-blue-50 text-blue-600" },
    E_WALLET: { icon: Smartphone, color: "bg-emerald-50 text-emerald-600" },
    CASH: { icon: Banknote, color: "bg-amber-50 text-amber-600" },
  };

  const openAdd = () => {
    setName("");
    setBalance("");
    setWalletType("BANK");
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
    const formData = { name, balance: initialBal, type: walletType };

    console.log("FORM DATA:", formData);
    const res = await addWallet(formData);

    setLoading(false);
    if (res.success) {
      setIsAddOpen(false);
      toast.success("Dompet berhasil ditambahkan");
      router.refresh();
    } else {
      toast.error(res.message || "Gagal menambahkan dompet");
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
      toast.success("Perubahan berhasil disimpan");
      router.refresh();
    } else {
      toast.error(res.message || "Gagal memperbarui dompet");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedWallet) return;
    setLoading(true);
    
    const res = await deleteWallet(selectedWallet.id);
    
    setLoading(false);
    if (res.success) {
      setIsDeleteOpen(false);
      toast.success("Dompet berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.message || "Gagal menghapus dompet");
    }
  };

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Wallet Management</h1>
          <p className="text-sm text-[#86868b] mt-1 font-medium tracking-tight">Manage your accounts, cards, and cash wallets.</p>
        </div>
        
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-80 w-fit"
        >
          <Plus className="h-4 w-4" />
          Add New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialWallets.map(w => (
          <div key={w.id} className="group relative bg-white border border-white/20 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-emerald-600 shadow-inner">
                  <WalletIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">{w.wallet_name}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      w.type === "BANK" ? "bg-blue-50 text-blue-600" :
                      w.type === "E_WALLET" ? "bg-emerald-50 text-emerald-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {w.type?.replace("_", " ") || "BANK"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#86868b] font-semibold tracking-tight mt-0.5">{w._count.transactions} transactions</p>
                </div>
              </div>
              
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                <button 
                  onClick={() => openEdit(w)} 
                  className="p-2 rounded-xl bg-gray-50/50 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" 
                  title="Edit Wallet"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => openDelete(w)} 
                  className="p-2 rounded-xl bg-gray-50/50 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" 
                  title="Delete Wallet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-10">
              <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                 {showBalance ? fmt(w.balance) : currency === "USD" ? "$ •••••••" : "Rp •••••••"}
              </p>
            </div>
          </div>
        ))}

        {initialWallets.length === 0 && (
          <div className="col-span-full rounded-[24px] border-2 border-dashed border-gray-200 p-16 text-center bg-gray-50/30">
            <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
              <WalletIcon className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">No wallets found</h3>
            <p className="mt-2 text-[14px] text-[#86868b] font-medium tracking-tight">Create your first wallet to start tracking finances.</p>
            <button 
              onClick={openAdd} 
              className="mt-8 bg-black text-white rounded-full px-8 py-3 text-sm font-bold shadow-md hover:opacity-80 transition-all"
            >
              + Add Wallet Now
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[32px] bg-white/90 backdrop-blur-xl border border-white/50 p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Wallet</h2>
              <button onClick={() => setIsAddOpen(false)} className="rounded-full p-2 hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Wallet Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="e.g., BCA, Cash, GoPay"
                  className="w-full rounded-2xl border-none bg-gray-50/50 px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Wallet Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {walletTypeOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWalletType(opt.value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${
                          walletType === opt.value
                            ? "border-emerald-500 bg-emerald-50/50 shadow-[0_0_10px_rgba(16,185,129,0.08)]"
                            : "border-gray-100 bg-white/50 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${walletType === opt.value ? opt.color : "bg-gray-50 text-gray-400"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-bold ${walletType === opt.value ? "text-gray-900" : "text-gray-500"}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Initial Balance (Rp)</label>
                <input 
                  type="number" value={balance} onChange={(e) => setBalance(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="w-full rounded-2xl border-none bg-gray-50/50 px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 transition-all outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 rounded-full bg-white border border-gray-100 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-2 flex justify-center items-center rounded-full bg-black py-4 px-8 text-sm font-bold text-white transition-all hover:opacity-80 disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Wallet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedWallet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[32px] bg-white/90 backdrop-blur-xl border border-white/50 p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Wallet</h2>
              <button onClick={() => setIsEditOpen(false)} className="rounded-full p-2 hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Wallet Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-2xl border-none bg-gray-50/50 px-5 py-4 text-gray-900 focus:ring-2 focus:ring-black/5 transition-all outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 rounded-full bg-white border border-gray-100 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-2 flex justify-center items-center rounded-full bg-black py-4 px-8 text-sm font-bold text-white transition-all hover:opacity-80 disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && selectedWallet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[32px] bg-white/90 backdrop-blur-xl border border-white/50 p-10 shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 mb-6 ring-1 ring-red-100">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Delete Wallet?</h2>
            <p className="mt-4 text-[14px] text-gray-500 font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{selectedWallet.wallet_name}</span>? 
              This will permanently delete all <span className="text-gray-900 font-bold">{selectedWallet._count.transactions} transactions</span>.
            </p>
            <div className="mt-10 flex flex-col gap-3">
              <button onClick={handleDeleteSubmit} disabled={loading} className="w-full flex justify-center items-center rounded-full bg-red-500 py-4 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-100">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Delete"}
              </button>
              <button onClick={() => setIsDeleteOpen(false)} className="w-full rounded-full bg-white border border-gray-100 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
