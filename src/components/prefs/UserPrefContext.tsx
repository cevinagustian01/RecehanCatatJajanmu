"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

type UserPrefs = {
  currency: string;
  locale: Locale;
  t: (key: string) => string;
  setCurrency: (c: string) => void;
  setLocale: (l: Locale) => void;
};

const defaultPrefs: UserPrefs = {
  currency: "IDR",
  locale: "id",
  t: (key: string) => key,
  setCurrency: () => {},
  setLocale: () => {},
};

const UserPrefCtx = createContext<UserPrefs>(defaultPrefs);

export function UserPrefProvider({
  children,
  initialCurrency,
  initialLocale,
}: {
  children: React.ReactNode;
  initialCurrency?: string;
  initialLocale?: Locale;
}) {
  const [currency, setCurrency] = useState(initialCurrency || "IDR");
  const [locale, setLocale] = useState(initialLocale || "id");

  const tFn = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <UserPrefCtx.Provider value={{ currency, locale, t: tFn, setCurrency, setLocale }}>
      {children}
    </UserPrefCtx.Provider>
  );
}

export function useUserPrefs() {
  return useContext(UserPrefCtx);
}
