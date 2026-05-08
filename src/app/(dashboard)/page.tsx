import { auth, currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";
import WalletCard from "@/components/dashboard/WalletCard";
import CashflowChart from "@/components/dashboard/CashflowChart";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import BudgetTracker from "@/components/dashboard/BudgetTracker";
import { getBudgetsWithSpent } from "@/actions/budget-actions";
import prisma from "@/lib/prisma";
import { fetchChartData } from "@/app/actions/transactions";

export const dynamic = 'force-dynamic';

export default async function Home(props: { 
  searchParams: Promise<{ timeRange?: string, wallet?: string }> 
}) {
  // 1. SINKRONISASI USER (Fix Error P2003)
  const { userId } = await auth();
  const user = await currentUser();
  const synced = userId && user ? await syncUser(userId, user.emailAddresses[0].emailAddress) : null;
  const localUserId: string | undefined = synced?.id;
  const searchParams = await props.searchParams;
  const timeRange = searchParams?.timeRange || "thisMonth";
  const wallet = searchParams?.wallet || "all";
  const now = new Date();
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  if (timeRange === "lastMonth") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }
  if (!localUserId) {
    return (
      <>
        <DashboardFilter wallets={[]} currentTimeRange={timeRange} currentWallet={wallet} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
          <WalletCard totalBalance={0} income={0} expenses={0} />
          <CashflowChart initialData={[]} />
        </div>
        <div className="mt-6">
          <BudgetTracker items={[]} />
        </div>
      </>
    );
  }
  const walletFilter =
    wallet === "all" ? { userId: localUserId } : { userId: localUserId, wallet_name: wallet };
  const txWalletFilter =
    wallet === "all"
      ? { wallet: { userId: localUserId } }
      : { wallet: { userId: localUserId, wallet_name: wallet } };
  const walletsData = await prisma.wallet.findMany({
    where: { userId: localUserId },
    select: { wallet_name: true }
  });
  const uniqueWallets = Array.from(new Set(walletsData.map(w => w.wallet_name)));
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
  const income = transactions.filter(t => String(t.type).toUpperCase() === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => String(t.type).toUpperCase() === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
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
    <>
      <DashboardFilter wallets={uniqueWallets} currentTimeRange={timeRange} currentWallet={wallet} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        <WalletCard totalBalance={totalBalance} income={income} expenses={expenses} />
        <CashflowChart initialData={initialChartData} />
      </div>
      <div className="mt-6">
        <BudgetTracker items={budgetItems} />
      </div>
      <div className="mt-6 w-full max-w-full">
        <PaymentHistory 
          initialData={tableData} 
          initialStartDate={startDate.toISOString()}
          initialEndDate={endDate.toISOString()}
        />
      </div>
    </>
  );
}
