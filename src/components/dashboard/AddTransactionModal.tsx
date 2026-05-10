"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWalletsList, addTransaction, updateTransactionDetails } from "@/app/actions/transactions";
import { parseTransactionWithAI } from "@/app/actions/ai-parser";
import { X, Loader2, MessageSquare, Camera, Mic, PenLine, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import CategoryDropdown from "@/components/CategoryDropdown";
import { cn } from "@/lib/utils";

type ModalMode = "selection" | "manual" | "ai" | "photo" | "voice";

export interface TransactionData {
  id?: string;
  walletId?: string;
  wallet?: string;
  type: string;
  amount: number | string;
  category: string;
  merchant: string;
  date?: string | Date;
}

export const AddTransactionModal = ({ isOpen, onClose, initialData }: { isOpen: boolean, onClose: () => void, initialData?: TransactionData | null }) => {
  const router = useRouter();
  const [mode, setMode] = useState<ModalMode>("selection");
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
        setMode("manual");
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
        setMode("selection");
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

  // Voice Recognition Logic
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Browser Anda tidak mendukung Voice Recognition.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Gagal mendengarkan suara.");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiInput(transcript);
      setMode("ai");
    };

    recognition.start();
  };

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("Fitur OCR sedang diproses... Mengalihkan ke Manual.");
      setMode("manual");
    }
  };

  const handleAiProcess = async () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    
    const res = await parseTransactionWithAI(aiInput);
    
    if (res.success && res.data) {
      setAmount(res.data.amount?.toString() || "");
      setMerchant(res.data.merchant || "");
      setCategory(res.data.category || CATEGORIES[0].value);
      if (res.data.date) setTransactionDate(res.data.date);
      if (res.data.type) setType(res.data.type);
      
      setMode("manual");
      toast.success("AI berhasil menganalisa transaksi Anda!");
    } else {
      toast.error(res.message || "AI gagal menganalisa teks. Coba tulis lebih jelas.");
    }
    
    setIsProcessing(false);
  };

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

    if (initialData && initialData.id) {
      res = await updateTransactionDetails(initialData.id as string, {
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
      toast.error(res.message || 'Waduh, gagal nyimpen transaksi nih.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-[32px] bg-white/90 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white relative animate-in zoom-in slide-in-from-bottom-4 duration-500 overflow-hidden">
        
        {/* Progress Bar (Apple Style) */}
        {isProcessing && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div className="h-full bg-emerald-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '30%' }} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {mode === "selection" ? "Pilih Metode" : initialData ? "Edit Transaksi" : "Tambah Transaksi"}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {mode === "selection" ? "Bagaimana cara Anda mencatat?" : "Kelola catatan keuangan Anda"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-2xl p-2.5 hover:bg-gray-100 text-gray-400 transition-all active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "selection" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setMode("ai")}
              className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[24px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">Chat AI</span>
            </button>

            <label className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[24px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={handlePhotoInput}
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">Foto Struk</span>
            </label>

            <button 
              onClick={handleVoiceInput}
              className={cn(
                "bg-white/80 backdrop-blur-md border border-white p-6 rounded-[24px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden",
                isListening && "ring-2 ring-red-500 animate-pulse"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">Voice</span>
            </button>

            <button 
              onClick={() => setMode("manual")}
              className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[24px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenLine className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-gray-900">Manual</span>
            </button>
          </div>
        )}

        {mode === "ai" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                Tulis apapun seperti "Makan siang di padang 50rb" dan AI akan memprosesnya.
              </p>
            </div>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Contoh: Beli bensin 200rb di Pertamina tadi pagi"
              className="w-full h-32 rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-gray-300 resize-none"
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={() => setMode("selection")}
                className="flex-1 h-12 rounded-2xl border border-gray-100 text-gray-500 hover:bg-gray-50 font-bold transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleAiProcess}
                disabled={isProcessing || !aiInput.trim()}
                className="flex-[2] h-12 rounded-2xl bg-black text-white font-bold shadow-lg hover:opacity-80 transition-all disabled:opacity-50"
              >
                {isProcessing ? "Memproses..." : "Analisa Sekarang"}
              </button>
            </div>
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex rounded-2xl bg-gray-100/50 p-1.5 border border-gray-100">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300",
                  type === "EXPENSE" 
                    ? "bg-white text-red-600 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300",
                  type === "INCOME" 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                Pemasukan
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nominal (Rp)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-4 text-xl font-black text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kategori</label>
                  <CategoryDropdown
                    value={category}
                    onChange={setCategory}
                    options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                    placeholder="Pilih kategori"
                    showAddCustom={false}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Merchant / Catatan</label>
                  <input 
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Contoh: Kopi Kenangan"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3.5 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tanggal</label>
                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3.5 text-sm font-bold text-gray-900 focus:border-emerald-500 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Dompet</label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3.5 text-sm font-bold text-gray-900 focus:border-emerald-500 transition-all outline-none appearance-none"
                    required
                    disabled={walletsLoading}
                  >
                    {walletsLoading ? (
                      <option value="" disabled>Loading...</option>
                    ) : wallets.length === 0 ? (
                      <option value="" disabled>No wallets</option>
                    ) : (
                      wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setMode("selection")}
                  className="flex-1 h-14 rounded-2xl border border-gray-100 text-gray-500 hover:bg-gray-50 font-bold transition-all"
                >
                  Ganti
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-[2] h-14 flex items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50",
                  type === "EXPENSE" ? "bg-black shadow-gray-200" : "bg-emerald-600 shadow-emerald-100"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</span>
                ) : initialData ? "Simpan Perubahan" : "Catat Transaksi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTransactionModal;
