import prisma from "@/lib/prisma";
import BudgetClient from "./BudgetClient";

export const revalidate = 60;

export default async function BudgetSettingsPage() {
  const budgets = await prisma.budget.findMany({
    orderBy: { created_at: "desc" },
    include: { category: true },
  });

  return (
    <BudgetClient
      initialBudgets={budgets.map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        category: b.category?.name ?? "Uncategorized",
        limitAmount: b.limitAmount,
        period: b.period,
        icon: b.icon ?? "🎯",
        created_at: b.created_at,
      }))}
    />
  );
}
