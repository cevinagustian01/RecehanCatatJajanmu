import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft, Wallet, Receipt, CreditCard, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserActions } from "../UserActions";
import { CreditActions } from "./CreditActions";
import { PlanActions } from "./PlanActions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      wallets: {
        include: {
          _count: { select: { transactions: true } },
        },
        orderBy: { created_at: "desc" },
      },
      budgets: {
        include: { category: true },
      },
      categories: true,
    },
  });

  if (!user) notFound();

  const userTransactions = await prisma.transaction.findMany({
    where: { wallet: { userId: user.id } },
    include: { wallet: true, category: true },
    orderBy: { created_at: "desc" },
    take: 20,
  });

  const totalBalance = user.wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalTxCount = user.wallets.reduce((sum, w) => sum + w._count.transactions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Detail</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        <UserActions userId={user.id} currentRole={user.role} />
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user.subscriptionPlan === "PRO" ? "bg-purple-100 text-purple-700" :
              user.subscriptionPlan === "ULTRA" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {user.subscriptionPlan}
            </span>
            <span className="text-sm text-gray-500">
              {user.subscriptionPlan === "ULTRA" ? "∞ credits" : `${user.credits}/${user.maxCredits} credits`}
            </span>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Balance</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatRupiah(totalBalance)}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joined</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{format(new Date(user.created_at), "dd MMM yyyy")}</p>
        </div>
      </div>

      {/* Credit Management */}
      <CreditActions userId={user.id} currentCredits={user.credits} maxCredits={user.maxCredits} plan={user.subscriptionPlan} />

      {/* Plan Management */}
      <PlanActions userId={user.id} currentPlan={user.subscriptionPlan} />

      {/* Wallets */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Wallets ({user.wallets.length})</h3>
        {user.wallets.length === 0 ? (
          <p className="text-sm text-gray-400">No wallets yet</p>
        ) : (
          <div className="space-y-3">
            {user.wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{wallet.wallet_name}</p>
                    <p className="text-xs text-gray-400">{wallet.type} • {wallet._count.transactions} transactions</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatRupiah(wallet.balance)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-100/80 rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Transactions ({totalTxCount})</h3>
          <Link href={`/admin/transactions?userId=${user.id}`} className="text-sm font-semibold text-blue-600 hover:opacity-70">
            View All →
          </Link>
        </div>
        {userTransactions.length === 0 ? (
          <p className="text-sm text-gray-400">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === "INCOME" || tx.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                    {tx.type === "INCOME" || tx.type === "credit" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tx.merchant}</p>
                    <p className="text-xs text-gray-400">{tx.category?.name || "Uncategorized"} • {tx.wallet?.wallet_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === "INCOME" || tx.type === "credit" ? "text-emerald-600" : "text-gray-900"}`}>
                    {tx.type === "INCOME" || tx.type === "credit" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{format(new Date(tx.created_at), "dd MMM")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
