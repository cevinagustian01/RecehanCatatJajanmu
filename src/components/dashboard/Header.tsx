"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import AddTransactionModal from "./AddTransactionModal";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();
  const fullName = user?.fullName || user?.firstName || "User";

  return (
    <>
      <header className="sticky top-6 z-50 mx-6 md:mx-10 flex items-center justify-between mb-8">
        {/* LEFT CONTENT (Profile Section) */}
        <div className="flex items-center gap-4 group cursor-pointer transition-all active:scale-95">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden ring-1 ring-black/5 flex-shrink-0">
            <UserButton appearance={{ elements: { avatarBox: "h-14 w-14 rounded-2xl" } }} />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.15em] uppercase mb-0.5">Selamat Datang,</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
              {fullName}
            </h2>
          </div>
        </div>

        {/* RIGHT CONTENT (Actions Section) */}
        <div className="flex items-center gap-3">
          {/* Add Transaction (Desktop Only) */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="hidden lg:flex h-12 gap-2 rounded-full bg-black px-8 items-center text-[15px] font-black text-white shadow-xl shadow-gray-200 transition-all hover:opacity-80 active:scale-95 mr-2"
          >
            <Plus className="h-5 w-5 stroke-[3px]" />
            Add Transaction
          </button>

          {/* Action Icons Group */}
          <div className="flex items-center gap-2.5 p-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white shadow-sm">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-90"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Button */}
            <button className="relative w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-90">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#FF3B30] border-2 border-white"></span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => signOut()}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all text-gray-600 active:scale-90"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
