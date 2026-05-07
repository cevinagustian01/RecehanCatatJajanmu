import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import prisma from "@/lib/prisma";
import BudgetClient from "./BudgetClient";

export const dynamic = "force-dynamic";

export default async function BudgetSettingsPage() {
  const budgets = await prisma.budget.findMany({
    orderBy: { category: 'asc' }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-[260px] flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 w-full max-w-full">
          <BudgetClient initialBudgets={budgets} />
        </main>
      </div>
    </div>
  );
}
