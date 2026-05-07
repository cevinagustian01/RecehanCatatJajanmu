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
    <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
      <Select 
        value={currentTimeRange} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("timeRange", val || ""))}
      >
        <SelectTrigger className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            <SelectValue placeholder="Pilih Waktu">{timeRangeLabel}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="thisMonth">Bulan Ini</SelectItem>
          <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
          <SelectItem value="all">Semua Waktu</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={currentWallet} 
        onValueChange={(val) => router.push(pathname + "?" + createQueryString("wallet", val || ""))}
      >
        <SelectTrigger className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:ring-2 focus:ring-emerald-500 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <CreditCard className="h-4 w-4 shrink-0 text-slate-500" />
            <SelectValue placeholder="Pilih Dompet">{walletLabel}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Dompet</SelectItem>
          {wallets.map(w => (
            <SelectItem key={w} value={w}>{w}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
