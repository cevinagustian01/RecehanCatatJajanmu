"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";

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

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      content: "Halo! Saya adalah asisten keuangan AI Anda. Saya siap membantu Anda menganalisis pengeluaran, memberikan wawasan, dan menjawab pertanyaan tentang keuangan pribadi Anda. Apa yang ingin Anda ketahui hari ini?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "User";

  useEffect(() => {
    setGreeting(getTimeOfDayGreeting());
  }, []);

  const handleSendMessage = (chipContent?: string) => {
    const messageContent = chipContent || inputValue.trim();
    if (!messageContent) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!chipContent) setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `Saya sedang menganalisis pertanyaan Anda: "${messageContent}". Fitur analisis penuh akan segera diintegrasikan dengan data keuangan real-time Anda. Untuk saat ini, cobalah pertanyaan seperti tentang pengeluaran bulan ini atau kategori pengeluaran terbesar Anda.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestionChips = [
    "Analisa pengeluaran bulan ini",
    "Kategori paling boros?",
    "Berapa sisa budget transport?",
  ];

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-48px)] overflow-hidden bg-white dark:bg-[#1C1C1E] md:rounded-3xl md:border md:border-gray-200 md:dark:border-white/10 md:shadow-sm">
      {/* HEADER: AI Finance Advisor (Fixed Top) */}
      <div className="flex-none z-20 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1C1C1E] md:rounded-t-3xl border-b border-gray-100 dark:border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              AI Finance Advisor
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {greeting}, {firstName} • Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* CHAT HISTORY AREA (Scrollable Middle) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "ai" && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] ${
                  msg.role === "ai"
                    ? "bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                    : "bg-black dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm text-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Chips + Input (Fixed Bottom) */}
      <div className="flex-none bg-white dark:bg-[#1C1C1E] md:rounded-b-3xl border-t border-gray-100 dark:border-white/10 p-4 pt-2 backdrop-blur-xl">
        {/* SUGGESTION CHIPS */}
        <div className="px-2 pb-4">
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-4 py-2 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="px-2">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Tanya sesuatu tentang dompetmu..."
              className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 focus:ring-[3px] focus:ring-gray-100 dark:focus:ring-white/5 transition-all shadow-sm"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 h-9 w-9 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
