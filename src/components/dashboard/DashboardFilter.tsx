"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback } from "react";
import { Calendar, CreditCard } from "lucide-react";

interface DashboardFilterProps {
  wallets: string[];
  currentTimeRange: string;
  currentWallet: string;
}

export default function DashboardFilter({ wallets, currentTimeRange, currentWallet }: DashboardFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const timeRangeLabel = currentTimeRange === "thisMonth" ? "Bulan Ini" : currentTimeRange === "lastMonth" ? "Bulan Lalu" : currentTimeRange === "all" ? "Semua Waktu" : "Pilih Waktu";
  const walletLabel = currentWallet === "all" ? "Semua Dompet" : currentWallet;

  return (
    <div className="flex flex-row items-center gap-2 w-full max-w-full overflow-x-auto no-scrollbar pb-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-700">
      <Select 
        value={currentTimeRange} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("timeRange", val || ""))}
      >
        <SelectTrigger className="flex-1 min-w-[140px] bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white hover:shadow-md transition-all h-12 focus:ring-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 truncate">
              <Calendar className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="text-[13px] font-bold text-gray-800 tracking-tight">{timeRangeLabel}</span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-[24px] border border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl p-1 animate-in zoom-in-95 duration-200">
          <SelectItem value="thisMonth" className="rounded-xl font-bold py-2.5">Bulan Ini</SelectItem>
          <SelectItem value="lastMonth" className="rounded-xl font-bold py-2.5">Bulan Lalu</SelectItem>
          <SelectItem value="all" className="rounded-xl font-bold py-2.5">Semua Waktu</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={currentWallet} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("wallet", val || ""))}
      >
        <SelectTrigger className="flex-1 min-w-[140px] bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white hover:shadow-md transition-all h-12 focus:ring-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 truncate">
              <CreditCard className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-[13px] font-bold text-gray-800 tracking-tight">{walletLabel}</span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-[24px] border border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl p-1 animate-in zoom-in-95 duration-200">
          <SelectItem value="all" className="rounded-xl font-bold py-2.5">Semua Dompet</SelectItem>
          {wallets.map(w => (
            <SelectItem key={w} value={w} className="rounded-xl font-bold py-2.5">{w}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
