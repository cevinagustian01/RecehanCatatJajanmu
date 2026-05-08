"use client";

import { useEffect, useMemo, useState } from "react";

type Insights = {
  dailyAverageExpense: number;
  currentBalance: number;
  daysUntilPayday: number | null;
  budgetAlert: boolean;

  thoughtfulSpendingCategory: {
    categoryName: string;
    thisMonthTotal: number;
    lastMonthTotal: number;
    delta: number;
  } | null;

  persona: string;
  regret: {
    topImpulsiveTxCount: number;
    regretAmount: number;
  } | null;
};

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function daysBetween(now: Date, future: Date) {
  const ms = future.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function AnalyticsHub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For now we compute a lightweight "Secret Sauce" purely client-side from
  // already-known settings values is not available. To keep UI functional
  // without additional server actions, we show deterministic placeholders.
  const [insights] = useState<Insights>({
    dailyAverageExpense: 0,
    currentBalance: 0,
    daysUntilPayday: null,
    budgetAlert: false,
    thoughtfulSpendingCategory: null,
    persona: "The Explorer",
    regret: null,
  });

  const personaBadge = useMemo(() => {
    if (insights.budgetAlert) return "The Panic Spender";
    if (insights.thoughtfulSpendingCategory?.delta && insights.thoughtfulSpendingCategory.delta > 0) return "The Sultan";
    return insights.persona;
  }, [insights]);

  if (!mounted) return null;

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">AI Analytics & Smart Reminders</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Budget alert, payday tracking, thoughtful spending, regret calculator, and persona tone.
      </p>

      <div className="mt-4 space-y-3">
        <div className="rounded-md bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">Budget Alert</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Triggers when (Current Balance / Days until payday) is less than Daily Avg Expense.
              </div>
            </div>
            <div
              className={
                "rounded-full px-3 py-1 text-xs font-semibold " +
                (insights.budgetAlert ? "bg-red-600/10 text-red-700" : "bg-green-600/10 text-green-700")
              }
            >
              {insights.budgetAlert ? "ALERT" : "OK"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="text-xs">
              <div className="text-muted-foreground">Daily Avg Expense</div>
              <div className="font-semibold">{formatMoney(insights.dailyAverageExpense)}</div>
            </div>
            <div className="text-xs">
              <div className="text-muted-foreground">Current Balance</div>
              <div className="font-semibold">{formatMoney(insights.currentBalance)}</div>
            </div>
            <div className="text-xs">
              <div className="text-muted-foreground">Days until Payday</div>
              <div className="font-semibold">{insights.daysUntilPayday ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted/30 p-3">
          <div className="text-sm font-semibold">Thoughtful Spending Reminder</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Compares current month vs last month spending per category.
          </div>

          {insights.thoughtfulSpendingCategory ? (
            <div className="mt-3 text-sm">
              Top category: <span className="font-semibold">{insights.thoughtfulSpendingCategory.categoryName}</span>
              <div className="mt-1 text-xs text-muted-foreground">
                This month: {formatMoney(insights.thoughtfulSpendingCategory.thisMonthTotal)} • Last month:{" "}
                {formatMoney(insights.thoughtfulSpendingCategory.lastMonthTotal)} • Delta:{" "}
                {formatMoney(insights.thoughtfulSpendingCategory.delta)}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-muted-foreground">No insight yet (connect analytics server action).</div>
          )}
        </div>

        <div className="rounded-md bg-muted/30 p-3">
          <div className="text-sm font-semibold">Financial Persona</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Tone will match your persona when notifications trigger.
          </div>
          <div className="mt-2 text-sm">
            Persona: <span className="font-semibold">{personaBadge}</span>
          </div>
        </div>

        <div className="rounded-md bg-muted/30 p-3">
          <div className="text-sm font-semibold">Regret Calculator</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Estimates how impulsive spend could grow over 10 years if invested.
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Connect impulsive transaction analysis server action to populate results.
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Note: AI sections are currently UI-ready; analytics data requires additional Server Actions to pull wallets & transactions.
        </div>
      </div>
    </section>
  );
}
