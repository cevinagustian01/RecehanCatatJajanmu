"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BalanceVisibilityContextType {
  showBalance: boolean;
  toggleBalance: () => void;
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType | undefined>(undefined);

export function BalanceVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("finflow_show_balance");
    if (stored !== null) {
      setShowBalance(stored === "true");
    }
  }, []);

  const toggleBalance = () => {
    setShowBalance((prev) => {
      const newState = !prev;
      localStorage.setItem("finflow_show_balance", String(newState));
      return newState;
    });
  };

  return (
    <BalanceVisibilityContext.Provider value={{ showBalance: mounted ? showBalance : true, toggleBalance }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext);
  if (context === undefined) {
    throw new Error("useBalanceVisibility must be used within a BalanceVisibilityProvider");
  }
  return context;
}
