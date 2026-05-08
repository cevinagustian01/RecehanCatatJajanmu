import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="md:ml-[260px] flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-8 overflow-hidden w-full max-w-full">
          {/* DashboardFilter Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center justify-between">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[160px]" />
          </div>

          {/* Top row: Wallet + Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
            {/* WalletCard Skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-xl relative overflow-hidden h-[240px]">
              <Skeleton className="h-6 w-32 bg-emerald-400/30 mb-4" />
              <Skeleton className="h-10 w-48 bg-emerald-400/30" />
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-emerald-400/20">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-emerald-400/30" />
                  <Skeleton className="h-6 w-24 bg-emerald-400/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-emerald-400/30" />
                  <Skeleton className="h-6 w-24 bg-emerald-400/30" />
                </div>
              </div>
            </div>

            {/* CashflowChart Skeleton */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 flex flex-col h-[240px]">
              <div className="mb-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex-1 flex items-end gap-3 justify-between mt-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="w-full bg-slate-100 rounded-t-sm" style={{ height: `${Math.random() * 50 + 20}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Budget Tracker Section Skeleton */}
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-6">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="space-y-6">
               {Array.from({ length: 2 }).map((_, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Skeleton className="h-8 w-8 rounded-lg" />
                         <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                 </div>
               ))}
            </div>
          </div>

          {/* Payment History Skeleton */}
          <div className="mt-6 w-full max-w-full">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-9 w-[120px]" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Skeleton className="h-5 w-24" />
                       <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
