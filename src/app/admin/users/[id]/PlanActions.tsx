"use client";

import { useState } from "react";
import { Crown, Zap, Gem } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  { key: "FREE", label: "Free", credits: 10, icon: Zap, color: "bg-gray-100 text-gray-600 border-gray-200", activeColor: "bg-gray-900 text-white" },
  { key: "PRO", label: "Pro", credits: 100, icon: Crown, color: "bg-purple-50 text-purple-600 border-purple-200", activeColor: "bg-purple-600 text-white" },
  { key: "ULTRA", label: "Ultra", credits: -1, icon: Gem, color: "bg-amber-50 text-amber-600 border-amber-200", activeColor: "bg-amber-500 text-white" },
];

export function PlanActions({ userId, currentPlan }: { userId: string; currentPlan: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanChange = async (plan: string) => {
    if (plan === currentPlan) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      if (res.ok) {
        toast.success(`Plan updated to ${plan}`);
        window.location.reload();
      } else {
        toast.error("Failed to update plan");
      }
    } catch (error) {
      toast.error("Error updating plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
      <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Subscription Plan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.key;
          const Icon = plan.icon;
          return (
            <button
              key={plan.key}
              onClick={() => handlePlanChange(plan.key)}
              disabled={isLoading || isActive}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isActive
                  ? `${plan.activeColor} border-transparent shadow-lg`
                  : `${plan.color} hover:shadow-md`
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-bold">{plan.label}</span>
              </div>
              <p className="text-xs opacity-80">
                {plan.credits === -1 ? "Unlimited credits" : `${plan.credits} credits`}
              </p>
              {isActive && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
