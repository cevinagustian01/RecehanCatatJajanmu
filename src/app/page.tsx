import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WalletCard from "@/components/dashboard/WalletCard";
import CashflowChart from "@/components/dashboard/CashflowChart";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import BudgetTracker from "@/components/dashboard/BudgetTracker";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home(props: { searchParams: Promise<{ timeRange?: string, wallet?: string }> }) {
  const searchParams = await props.searchParams;
  const timeRange = searchParams?.timeRange || "thisMonth";
  const wallet = searchParams?.wallet || "all";

  // Compute date filters
  const now = new Date();
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  if (timeRange === "lastMonth") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }

  // Filter conditions
  const walletFilter = wallet === "all" ? {} : { wallet_name: wallet };
  const txWalletFilter = wallet === "all" ? {} : { wallet: { wallet_name: wallet } };

  // Fetch Wallets for Filter Dropdown
  const walletsData = await prisma.wallet.findMany({ select: { wallet_name: true } });
  const uniqueWallets = Array.from(new Set(walletsData.map(w => w.wallet_name)));

  // 1. Get Wallet Card Stats
  const wallets = await prisma.wallet.findMany({
    where: walletFilter
  });
  const totalBalance = wallets.reduce((sum, w) => sum + w.current_balance, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      ...txWalletFilter,
      created_at: { gte: startDate, lte: endDate }
    },
    include: { wallet: true },
    orderBy: { created_at: 'asc' } // Ascending for chart grouping
  });

  const income = transactions.filter(t => String(t.type).toUpperCase() === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => String(t.type).toUpperCase() === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  // 2. Prepare Cashflow Chart Data
  const cashflowMap = new Map();
  // Initialize days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    cashflowMap.set(day, { name: day, income: 0, expenses: 0 });
  }

  transactions.forEach(t => {
    const day = t.created_at.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (cashflowMap.has(day)) {
      const existing = cashflowMap.get(day);
      if (String(t.type).toUpperCase() === 'INCOME') existing.income += t.amount;
      if (String(t.type).toUpperCase() === 'EXPENSE') existing.expenses += t.amount;
    }
  });
  const chartData = Array.from(cashflowMap.values());

  // 3. Map Transactions for PaymentHistory
  // We want table to show latest first, so reverse the asc sorted array
  const tableData = [...transactions].reverse().map(tx => ({
      id: tx.id,
      name: tx.merchant,
      category: tx.category,
      wallet: tx.wallet.wallet_name,
      amount: tx.amount,
      type: (String(tx.type).toUpperCase() === 'INCOME' ? 'credit' : 'debit') as "credit" | "debit",
      date: tx.created_at,
      status: 'completed',
  }));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="md:ml-[260px] flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-8 overflow-hidden w-full max-w-full">
          <DashboardFilter wallets={uniqueWallets} currentTimeRange={timeRange} currentWallet={wallet} />

          {/* Top row: Wallet + Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            <WalletCard totalBalance={totalBalance} income={income} expenses={expenses} />
            <CashflowChart data={chartData} />
          </div>

          {/* Budget Tracker Section */}
          {await (async () => {
            const budgets = await prisma.budget.findMany();
            if (budgets.length === 0) return null;

            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const monthExpenses = await prisma.transaction.findMany({
              where: {
                type: "EXPENSE",
                created_at: { gte: monthStart, lte: monthEnd }
              }
            });

            const spentByCategory = new Map<string, number>();
            monthExpenses.forEach(tx => {
              const cat = tx.category.toLowerCase();
              spentByCategory.set(cat, (spentByCategory.get(cat) || 0) + tx.amount);
            });

            const budgetItems = budgets.map(b => ({
              category: b.category,
              spent: spentByCategory.get(b.category.toLowerCase()) || 0,
              limit: b.limitAmount
            }));

            return (
              <div className="mt-6">
                <BudgetTracker items={budgetItems} />
              </div>
            );
          })()}

          {/* Payment History */}
          <div className="mt-6 w-full max-w-full">
            <PaymentHistory initialData={tableData} />
          </div>
        </main>
      </div>
    </div>
  );
}
