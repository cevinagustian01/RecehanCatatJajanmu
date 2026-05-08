import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-10 w-full md:w-[300px] rounded-lg" />
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <div className="w-full">
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex gap-4">
              <Skeleton className="h-4 w-24 flex-1" />
              <Skeleton className="h-4 w-24 flex-1" />
              <Skeleton className="h-4 w-24 flex-1" />
              <Skeleton className="h-4 w-24 flex-1" />
              <Skeleton className="h-4 w-24 flex-1" />
              <div className="flex-1" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 items-center">
                  <div className="flex-[1.5] flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex-1"><Skeleton className="h-6 w-20 rounded-md" /></div>
                  <div className="flex-1 flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex-1"><Skeleton className="h-5 w-24" /></div>
                  <div className="flex-1 flex justify-end"><Skeleton className="h-5 w-20" /></div>
                  <div className="flex-1 flex justify-end"><Skeleton className="h-8 w-8 rounded-md" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile List Cards Skeleton */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
