"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Sun, Moon, LogOut, Plus } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "next-themes";
import AddTransactionModal from "./AddTransactionModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWalletsList } from "@/app/actions/wallets";

/**
 * Utility: Get Indonesian time-of-day greeting
 */
function getTimeOfDayGreeting(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 12) return "Selamat Pagi";
  if (hour >= 12 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18.5) return "Selamat Sore";
  return "Selamat Malam";
}

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [greeting, setGreeting] = useState<string>("");
  const [wallets, setWallets] = useState<{ id: string; name: string }[]>([]);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const timeRange = searchParams?.get("timeRange") || "thisMonth";
  const wallet = searchParams?.get("wallet") || "all";

  // Set greeting on mount
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting());
  }, []);

  useEffect(() => {
    const fetchWallets = async () => {
      const list = await getWalletsList();
      setWallets(list);
    };
    fetchWallets();
  }, []);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const timeRangeLabel =
    timeRange === "thisMonth" ? "Bulan Ini" : timeRange === "lastMonth" ? "Bulan Lalu" : "Semua Waktu";
  const walletLabel = wallet === "all" ? "Semua Dompet" : wallet;

  // Extract first name from full name
  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* WRAPPER: Gives space around the floating shape */}
      <div className="w-full pt-4 px-4 md:px-0">
        {/* THE SHAPE: Floating Frosted Glass Panel */}
        <header className="mx-auto flex w-full max-w-full items-center justify-between rounded-[28px] border border-white/60 bg-white/60 px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/60">
          
          {/* COLUMN 1 (Left): 33.3% width - Attention */}
          <div className="flex flex-1 items-center justify-start">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{greeting}</span>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{firstName}</h1>
            </div>
          </div>

          {/* COLUMN 2 (Center): 33.3% width - Interest */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="group relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full rounded-full border border-gray-200/80 bg-gray-50/80 py-2 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all duration-300 hover:bg-white focus:border-gray-300 focus:bg-white focus:ring-[3px] focus:ring-gray-200/50 dark:border-transparent dark:bg-black/50 dark:text-white"
              />
            </div>
          </div>

          {/* COLUMN 3 (Right): 33.3% width - Desire & Action */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Mobile Search Icon */}
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 md:hidden">
              <Search className="h-4 w-4" />
            </button>

            {/* Desktop Primary Action (Hidden on Mobile) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Tambah Transaksi</span>
            </button>
            
            {/* Notification Bell */}
            <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-900">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500"></span>
            </button>

            {/* Profile Avatar */}
            <div className="h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full shadow-sm ring-1 ring-gray-200 transition-all hover:ring-gray-300">
              <img src={user?.user_metadata?.avatar_url || "/avatar-placeholder.png"} alt="Profile" className="h-full w-full object-cover" />
            </div>
          </div>

        </header>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
