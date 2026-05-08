import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import TransactionSearch from "@/components/transactions/TransactionSearch";
import TransactionActions from "@/components/transactions/TransactionActions";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Wallet, ArrowUpRight, TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage(props: { searchParams: Promise<{ query?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const take = 10;
  const skip = (currentPage - 1) * take;

  const whereClause = query
    ? {
        OR: [
          { merchant: { contains: query, mode: "insensitive" as const } },
          { category: { name: { contains: query, mode: "insensitive" as const } } },
          { wallet: { wallet_name: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const totalItems = await prisma.transaction.count({
    where: whereClause
  });

  const totalPages = Math.ceil(totalItems / take);

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
    take,
    skip,
    include: { wallet: true, category: true },
  });

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your transaction history.</p>
        </div>
        
        <TransactionSearch defaultValue={query} />
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Wallet</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        String(tx.type).toUpperCase() === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {String(tx.type).toUpperCase() === 'INCOME' ? <ArrowUpRight className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{tx.merchant}</p>
                        <p className="text-xs text-slate-500">{String(tx.type).toUpperCase() === 'INCOME' ? 'Credit' : 'Debit'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {tx.category?.name ?? "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{tx.wallet.wallet_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {tx.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${String(tx.type).toUpperCase() === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {String(tx.type).toUpperCase() === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TransactionActions tx={tx} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List Cards */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No transactions found.</div>
          ) : transactions.map(tx => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  String(tx.type).toUpperCase() === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {String(tx.type).toUpperCase() === 'INCOME' ? <ArrowUpRight className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                </div>
                <div className="truncate flex-1">
                  <p className="font-semibold text-slate-900 truncate max-w-[120px]">{tx.merchant}</p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span className="truncate max-w-[60px]">{tx.category?.name}</span>
                    <span>•</span>
                    <span className="truncate max-w-[60px]">{tx.wallet.wallet_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-3">
                <span className={`font-bold text-sm ${String(tx.type).toUpperCase() === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {String(tx.type).toUpperCase() === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 mb-2">
                  {tx.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <TransactionActions tx={tx} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500 hidden sm:block">
              Showing <span className="font-medium text-slate-900">{(currentPage - 1) * take + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * take, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span>
            </p>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Link 
                href={`/transactions?query=${query}&page=${Math.max(1, currentPage - 1)}`}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${currentPage === 1 ? 'pointer-events-none text-slate-300' : 'text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
              
              <span className="text-sm font-medium text-slate-600 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>
              
              <Link 
                href={`/transactions?query=${query}&page=${Math.min(totalPages, currentPage + 1)}`}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${currentPage === totalPages ? 'pointer-events-none text-slate-300' : 'text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
