"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCallback } from "react";

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

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl ring-1 ring-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Periode:</span>
        <Select 
          value={currentTimeRange} 
          onValueChange={(val) => router.push(pathname + "?" + createQueryString("timeRange", val || ""))}
        >
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Pilih Waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">Bulan Ini</SelectItem>
            <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Dompet:</span>
        <Select 
          value={currentWallet} 
          onValueChange={(val) => router.push(pathname + "?" + createQueryString("wallet", val || ""))}
        >
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Pilih Dompet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dompet</SelectItem>
            {wallets.map(w => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
