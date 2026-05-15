"use client";

import { Sparkles, Send as SendIcon } from "lucide-react";

export default function AIFinanceAdvisor() {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-[24px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col flex-1 min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="font-semibold text-[#1D1D1F] flex items-center gap-2 tracking-tight">
          <Sparkles className="w-5 h-5 text-[#007AFF]" />
          AI Finance Advisor
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
          <span className="text-[12px] text-[#86868b] font-semibold tracking-tight">Online</span>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-full px-4 py-2 text-[12px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer tracking-tight">
          Analisa pengeluaran bulan ini
        </div>
        <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-full px-4 py-2 text-[12px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer tracking-tight">
          Kategori paling boros?
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5F7]/50 rounded-[20px] p-6 mb-6 flex flex-col justify-end">
        <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-[18px] rounded-bl-[4px] p-4 text-[14px] text-[#1D1D1F] w-[85%] shadow-sm leading-relaxed">
          Halo Cevin! Ada yang bisa saya bantu analisis dari keuanganmu hari ini?
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center w-full">
        <input 
          type="text" 
          placeholder="Tanya sesuatu tentang dompetmu..." 
          className="w-full bg-[#F5F5F7] border-none rounded-xl pl-5 pr-14 py-4 text-[14px] outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all shadow-inner placeholder:text-[#86868b]" 
        />
        <button className="absolute right-2 bg-black hover:bg-gray-800 text-white p-2.5 rounded-[12px] transition-all">
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
