import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionActions } from "./TransactionActions";
import { format } from "date-fns";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams?.q || "";

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { merchant: { contains: query, mode: "insensitive" } },
        // Transaction.category is a relation, so filter using category relation's name (Prisma: category: { name: ... })
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      wallet: {
        include: { user: true },
      },
      category: true,
    },
    orderBy: { created_at: "desc" },
    take: 100, // Limit to 100 for admin view
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transaction Logs</h1>
        
        {/* Simple Search Form using native web action (GET request) */}
        <form method="GET" action="/admin/transactions" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search merchant or category..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </form>
      </div>
      
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-slate-800">
              <TableHead className="text-slate-500 dark:text-slate-400">Date</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">User (Wallet)</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Merchant</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Category</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400">Amount</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No transactions found {query && `matching "${query}"`}
                </TableCell>
              </TableRow>
            )}
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="dark:border-slate-800 dark:hover:bg-slate-800/50">
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm")}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                  <span className="block text-sm" title={tx.wallet?.user?.clerk_id || tx.wallet?.user?.id}>
                    {tx.wallet?.user?.clerk_id || tx.wallet?.user?.telegram_id || "Unknown User"}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Wallet: {tx.wallet?.wallet_name || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                  {tx.merchant}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {tx.category?.name ?? "Uncategorized"}
                  </span>
                </TableCell>
                <TableCell className={`text-right font-bold ${tx.type === 'INCOME' || tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'INCOME' || tx.type === 'credit' ? '+' : '-'}Rp {tx.amount.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <TransactionActions transactionId={tx.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
