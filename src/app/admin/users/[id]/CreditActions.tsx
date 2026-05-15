"use client";

import { useState } from "react";
import { CreditCard, Plus, Minus, Gem } from "lucide-react";
import { toast } from "sonner";

export function CreditActions({ userId, currentCredits, maxCredits, plan }: { userId: string; currentCredits: number; maxCredits: number; plan?: string }) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isUnlimited = plan === "ULTRA";
  const displayCredits = isUnlimited ? "∞" : currentCredits.toString();
  const displayMax = isUnlimited ? "∞" : maxCredits.toString();

  const handleUpdateCredits = async (action: "add" | "remove" | "set") => {
    const value = parseInt(amount);
    if (isNaN(value) || value < 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, amount: value }),
      });

      if (res.ok) {
        toast.success("Credits updated successfully");
        setAmount("");
        window.location.reload();
      } else {
        toast.error("Failed to update credits");
      }
    } catch (error) {
      toast.error("Error updating credits");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Credit Management</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-gray-50 rounded-xl p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Credits</p>
          <p className="text-2xl font-bold text-gray-900">{displayCredits}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Max Credits</p>
          <p className="text-2xl font-bold text-gray-900">{displayMax}</p>
        </div>
      </div>

      {!isUnlimited && (
        <div className="flex items-center gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Jumlah credits"
          className="flex-1 h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          disabled={isLoading}
        />
        <button
          onClick={() => handleUpdateCredits("add")}
          disabled={isLoading || !amount}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
        <button
          onClick={() => handleUpdateCredits("remove")}
          disabled={isLoading || !amount}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          <Minus className="h-4 w-4" />
          Remove
        </button>
        <button
          onClick={() => handleUpdateCredits("set")}
          disabled={isLoading || !amount}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          Set
        </button>
      </div>
      )}

      {isUnlimited && (
        <p className="text-sm text-amber-600 font-semibold flex items-center gap-2">
          <Gem className="h-4 w-4" />
          Unlimited credits — no manual management needed
        </p>
      )}
    </div>
  );
}
