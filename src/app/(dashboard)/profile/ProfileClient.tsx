"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  MessageCircle, 
  Send, 
  HelpCircle, 
  FileText,
  Camera,
  CheckCircle2
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: initialUser?.displayName || "",
    email: initialUser?.email || "",
    phoneNumber: initialUser?.phoneNumber || "",
    connectWhatsApp: initialUser?.connectWhatsApp || false,
    connectTelegram: initialUser?.connectTelegram || false,
  });

  const creditPercentage = (initialUser?.credits / initialUser?.maxCredits) * 100;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({
      displayName: formData.displayName,
      phoneNumber: formData.phoneNumber,
      connectWhatsApp: formData.connectWhatsApp,
      connectTelegram: formData.connectTelegram,
    });
    setLoading(false);
    if (res.success) {
      toast.success("Profil berhasil diperbarui");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row items-center gap-8 bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
            <img 
              src={initialUser?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute -bottom-2 -right-2 bg-black text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{initialUser?.displayName || "User"}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              initialUser?.subscriptionPlan === "PRO" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {initialUser?.subscriptionPlan || "FREE"}
            </span>
          </div>
          <p className="text-gray-500 font-medium mb-4">{initialUser?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-2xl border border-white shadow-sm">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-700">{initialUser?.credits} Kredit Tersisa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-2xl border border-white shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700">Akun Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Detail Pengguna</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-white/80 border border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-gray-900 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                  <input 
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-5 py-3 rounded-2xl bg-white/80 border border-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-gray-900 shadow-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email (Read-only)</label>
                  <input 
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 font-medium text-gray-400 cursor-not-allowed shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

          {/* Connectivity */}
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-8">Konektivitas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-white shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">WhatsApp Alert</p>
                    <p className="text-xs text-gray-400 font-medium tracking-tight">Kirim notifikasi ke WhatsApp</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFormData({...formData, connectWhatsApp: !formData.connectWhatsApp})}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.connectWhatsApp ? "bg-emerald-500" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                    formData.connectWhatsApp ? "right-1" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-white shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Telegram Bot</p>
                    <p className="text-xs text-gray-400 font-medium tracking-tight">Catat otomatis via Telegram</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFormData({...formData, connectTelegram: !formData.connectTelegram})}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.connectTelegram ? "bg-blue-500" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                    formData.connectTelegram ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Credits & Subs */}
        <div className="lg:col-span-5 space-y-8">
          {/* Usage Credits */}
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Usage Credits</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-black text-gray-900">{initialUser?.credits}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kredit Tersisa</p>
                  </div>
                  <p className="text-xs font-bold text-gray-400">Kuota: {initialUser?.maxCredits}</p>
                </div>

                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    style={{ width: `${creditPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                  * Kredit berkurang setiap kali Anda menambah transaksi baru. Upgrade untuk kuota tanpa batas.
                </p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 transition-transform group-hover:scale-110">
              <ShieldCheck className="w-24 h-24 text-gray-900" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Subscription Plan</h2>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-gray-900">{initialUser?.subscriptionPlan === "PRO" ? "Premium" : "Free Tier"}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited Wallets",
                  "AI Financial Persona",
                  "Advanced Analytics",
                  "Telegram & WhatsApp Sync"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                {initialUser?.subscriptionPlan === "PRO" ? "Manage Subscription" : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Bantuan & Legal</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm font-bold text-gray-700">Hubungi Domptt Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
              
              <button className="flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  <span className="text-sm font-bold text-gray-700">Syarat & Ketentuan (SnK)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>

              <button className="flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  <span className="text-sm font-bold text-gray-700">Pusat Bantuan (FAQ)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
