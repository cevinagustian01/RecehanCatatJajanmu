"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, ChevronRight, Sun, Moon } from "lucide-react";
import { saveOnboarding } from "@/app/actions/profile";
import { toast } from "sonner";
import { t as translate } from "@/lib/i18n";

function OptionCard({ selected, onClick, icon, title, subtitle }: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center p-4 w-full rounded-2xl border transition-all duration-300 ease-out active:scale-[0.98] focus:outline-none
        ${selected
          ? "border-emerald-500 bg-emerald-50/50 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
          : "border-gray-100 bg-white/50 hover:bg-white hover:shadow-md"
        }`}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${selected ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400"}`}>
            {icon}
          </div>
        )}
        <div className="flex flex-col items-start text-left">
          <span className={`font-semibold text-[15px] ${selected ? "text-gray-900" : "text-gray-700"}`}>
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
        ${selected ? "bg-emerald-500 scale-100 opacity-100" : "bg-transparent scale-50 opacity-0"}
      `}>
        <Check className="w-4 h-4 text-white stroke-[3]" />
      </div>
    </button>
  );
}

export default function OnboardingClient() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "id",
    theme: "light",
    currency: "idr",
  });

  const updatePreference = (key: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    if (key === "theme") {
      setTheme(value);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await saveOnboarding(preferences);
    setLoading(false);
    if (res.success) {
      router.push("/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-4 sm:p-8 selection:bg-emerald-500/30">
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-[1.25rem] flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-black text-3xl tracking-tighter">D</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {translate("onboarding.title", preferences.language as "id" | "en")}
          </h1>
          <p className="text-[#86868b] text-sm sm:text-base font-medium">
            {translate("onboarding.subtitle", preferences.language as "id" | "en")}
          </p>
        </div>

        {/* FORM OPTIONS */}
        <div className="space-y-8">

          {/* Language */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{translate("onboarding.language", preferences.language as "id" | "en")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard
                title="English"
                subtitle="US"
                selected={preferences.language === "en"}
                onClick={() => updatePreference("language", "en")}
              />
              <OptionCard
                title="Indonesia"
                subtitle="ID"
                selected={preferences.language === "id"}
                onClick={() => updatePreference("language", "id")}
              />
            </div>
          </section>

          {/* Theme */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{translate("onboarding.theme", preferences.language as "id" | "en")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard
                title={translate("onboarding.themeLight", preferences.language as "id" | "en")}
                icon={<Sun className="w-5 h-5" />}
                selected={preferences.theme === "light"}
                onClick={() => updatePreference("theme", "light")}
              />
              <OptionCard
                title={translate("onboarding.themeDark", preferences.language as "id" | "en")}
                icon={<Moon className="w-5 h-5" />}
                selected={preferences.theme === "dark"}
                onClick={() => updatePreference("theme", "dark")}
              />
            </div>
          </section>

          {/* Currency */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{translate("onboarding.currency", preferences.language as "id" | "en")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard
                title="IDR"
                subtitle="Rupiah"
                selected={preferences.currency === "idr"}
                onClick={() => updatePreference("currency", "idr")}
              />
              <OptionCard
                title="USD"
                subtitle="Dollar"
                selected={preferences.currency === "usd"}
                onClick={() => updatePreference("currency", "usd")}
              />
            </div>
          </section>

        </div>

        {/* SUBMIT */}
        <div className="mt-12">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg disabled:opacity-50"
          >
            {loading ? translate("onboarding.saving", preferences.language as "id" | "en") : translate("onboarding.continue", preferences.language as "id" | "en")}
            {!loading && <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
          </button>
        </div>

      </div>
    </div>
  );
}
