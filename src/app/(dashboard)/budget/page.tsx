import BudgetManager from "./BudgetManager";
import { getBudgetsWithSpent } from "@/actions/budget-actions";
import { getCategories } from "@/actions/category-actions";

export const revalidate = 30;

export default async function BudgetPage() {
  const [budgets, categories] = await Promise.all([
    getBudgetsWithSpent(),
    getCategories()
  ]);

  return (
    <div className="space-y-6">
      <BudgetManager initialBudgets={budgets} initialCategories={categories} />
    </div>
  );
}
