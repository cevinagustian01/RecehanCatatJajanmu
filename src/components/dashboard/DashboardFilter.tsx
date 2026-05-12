"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useCallback } from "react";
import { Calendar, Wallet, ChevronDown } from "lucide-react";

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

  const pillClass = "flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-full px-5 py-2.5 shadow-sm cursor-pointer hover:bg-gray-50 transition-all h-auto focus:ring-0 focus:outline-hidden";

  return (
    <div className="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar">
      {/* Date Picker Pill */}
      <Select 
        value={currentTimeRange} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("timeRange", val || ""))}
      >
        <SelectTrigger className={pillClass}>
          <div className="flex items-center gap-3 w-full">
            <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-800">{timeRangeLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 ml-auto" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-2xl border border-gray-100 bg-white shadow-xl p-1 animate-in zoom-in-95 duration-200">
          <SelectItem value="thisMonth" className="rounded-xl font-medium py-2">Bulan Ini</SelectItem>
          <SelectItem value="lastMonth" className="rounded-xl font-medium py-2">Bulan Lalu</SelectItem>
          <SelectItem value="all" className="rounded-xl font-medium py-2">Semua Waktu</SelectItem>
        </SelectContent>
      </Select>

      {/* Wallet Selector Pill */}
      <Select 
        value={currentWallet} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("wallet", val || ""))}
      >
        <SelectTrigger className={pillClass}>
          <div className="flex items-center gap-3 w-full">
            <Wallet className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="text-sm font-semibold text-gray-800">{walletLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 ml-auto" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-2xl border border-gray-100 bg-white shadow-xl p-1 animate-in zoom-in-95 duration-200">
          <SelectItem value="all" className="rounded-xl font-medium py-2">Semua Dompet</SelectItem>
          {wallets.map(w => (
            <SelectItem key={w} value={w} className="rounded-xl font-medium py-2">{w}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

