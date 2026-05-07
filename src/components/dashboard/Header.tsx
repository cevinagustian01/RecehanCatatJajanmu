"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AddTransactionModal from "./AddTransactionModal";

export default function Header() {
  const [greeting, setGreeting] = useState("Selamat Pagi, Cevin!");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi, Cevin! 🌅");
    else if (hour < 15) setGreeting("Selamat Siang, Cevin! ☀️");
    else if (hour < 18) setGreeting("Selamat Sore, Cevin! 🌇");
    else setGreeting("Selamat Malam, Cevin! 🌙");
  }, []);

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-slate-100 bg-white/80 p-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5 backdrop-blur-md">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {greeting}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
        {/* Search */}
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full md:w-56 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none"
          />
        </div>

        {/* Notification */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 hover:bg-white hover:shadow-sm">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-slate-200" />

        {/* Add Transaction (Desktop Only) */}
        <Button onClick={() => setIsModalOpen(true)} className="hidden md:flex h-10 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700 border-none">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>

        {/* Avatar */}
        <Avatar className="h-10 w-10 ring-2 ring-emerald-100 ring-offset-2">
          <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Alex" alt="Alex" />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
            AL
          </AvatarFallback>
        </Avatar>
      </div>
      </header>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
