import { auth, currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";
import WalletCard from "@/components/dashboard/WalletCard";
import FinancialHealth from "@/components/dashboard/FinancialHealth";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BudgetTracker from "@/components/dashboard/BudgetTracker";
import { getBudgetsWithSpent } from "@/actions/budget-actions";
import prisma from "@/lib/prisma";
import { fetchChartData } from "@/app/actions/transactions";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import DashboardLoading from "./loading";

const DynamicCashflowChart = dynamic(() => import("@/components/dashboard/CashflowChart"), {
  loading: () => <div className="h-[380px] rounded-[32px] bg-gray-200/60 animate-pulse border border-white/20" />,
});

const DynamicAIFinanceAdvisor = dynamic(() => import("@/components/dashboard/AIFinanceAdvisor"), {
  loading: () => <div className="h-[176px] rounded-[32px] bg-gray-200/60 animate-pulse border border-white/20" />,
});

async function DashboardData({ localUserId, timeRange, wallet }: { localUserId?: string; timeRange: string; wallet: string }) {
  if (!localUserId) {
    return (
      <div className="space-y-6">
        <WalletCard totalBalance={0} income={0} expenses={0} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DynamicCashflowChart initialData={[]} />
          <div className="flex flex-col gap-6">
            <FinancialHealth income={0} expenses={0} />
            <DynamicAIFinanceAdvisor />
          </div>
        </div>
        <BudgetTracker items={[]} />
      </div>
    );
  }

  const now = new Date();
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  if (timeRange === "lastMonth") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }

  const walletFilter =
    wallet === "all" ? { userId: localUserId } : { userId: localUserId, wallet_name: wallet };
  const txWalletFilter =
    wallet === "all"
      ? { wallet: { userId: localUserId } }
      : { wallet: { userId: localUserId, wallet_name: wallet } };

  try {
    const wallets = await prisma.wallet.findMany({
      where: localUserId ? walletFilter : undefined
    });
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        ...txWalletFilter,
        created_at: { gte: startDate, lte: endDate }
      },
      include: { wallet: true, category: true },
      orderBy: { created_at: 'asc' }
    });

    const income = transactions
      .filter(t => String(t.type).toUpperCase() === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => String(t.type).toUpperCase() === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const initialChartData = await fetchChartData("monthly");

    const tableData = [...transactions].reverse().map(tx => ({
      id: tx.id,
      name: tx.merchant,
      category: tx.category?.name ?? "",
      wallet: tx.wallet.wallet_name,
      amount: tx.amount,
      type: (String(tx.type).toUpperCase() === 'INCOME' ? 'credit' : 'debit') as "credit" | "debit",
      date: tx.created_at,
      status: 'completed',
    }));

    const budgetItems = await getBudgetsWithSpent();

    return (
      <div className="space-y-4 md:space-y-6">
        <WalletCard totalBalance={totalBalance} income={income} expenses={expenses} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DynamicCashflowChart initialData={initialChartData} />
          <div className="flex flex-col gap-6">
            <FinancialHealth income={income} expenses={expenses} />
            <DynamicAIFinanceAdvisor />
          </div>
        </div>
        <BudgetTracker items={budgetItems} />
        <RecentTransactions transactions={tableData} />
      </div>
    );
  } catch (error) {
    console.error("Data fetch error:", error);
    return (
      <div className="p-8 text-center bg-rose-50 rounded-[32px] border border-rose-100">
        <h2 className="text-xl font-bold text-rose-600 mb-2">Gagal Memuat Data</h2>
        <p className="text-rose-500 mb-4">Terjadi kesalahan saat memuat data dashboard. Silakan muat ulang halaman ini.</p>
      </div>
    );
  }
}

export default async function Home(props: {
  searchParams: Promise<{ timeRange?: string, wallet?: string }>
}) {
  const { userId } = await auth();
  const user = await currentUser();
  const synced = userId && user ? await syncUser(userId, user.emailAddresses[0].emailAddress) : null;
  const localUserId: string | undefined = synced?.id;
  const searchParams = await props.searchParams;
  const timeRange = searchParams?.timeRange || "thisMonth";
  const wallet = searchParams?.wallet || "all";

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData localUserId={localUserId} timeRange={timeRange} wallet={wallet} />
    </Suspense>
  );
}
