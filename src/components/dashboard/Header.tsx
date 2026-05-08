"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import AddTransactionModal from "./AddTransactionModal";

export default function Header() {
  const [greetingTime, setGreetingTime] = useState("Selamat Pagi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const userName = user?.firstName || "User";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime("Selamat Pagi");
    else if (hour < 15) setGreetingTime("Selamat Siang");
    else if (hour < 18) setGreetingTime("Selamat Sore");
    else setGreetingTime("Selamat Malam");
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 dark:bg-background/95 dark:border-border flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5" style={{ gridArea: 'header' }}>
      {/* Left side */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greetingTime}, {userName}!
          </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening with your finances today.
        </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
        {/* Search */}
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full md:w-56 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notification */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              3
            </span>
          </button>
          {/* Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Notifications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Add Transaction (Desktop Only) */}
        <Button onClick={() => setIsModalOpen(true)} className="hidden md:flex h-10 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700 border-none">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>

        {/* User Button */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-emerald-100 ring-offset-2 dark:ring-emerald-900/50 dark:ring-offset-slate-950">
          <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
        </div>
      </div>
      </header>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
