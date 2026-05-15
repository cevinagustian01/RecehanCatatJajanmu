export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-500">
      {/* Hero Balance Card Skeleton */}
      <div className="w-full h-[220px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />
      
      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[380px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />
        <div className="flex flex-col gap-6">
          <div className="h-[180px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />
          <div className="h-[176px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />
        </div>
      </div>

      {/* Budget Tracker Skeleton */}
      <div className="h-[280px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />

      {/* Recent Transactions Skeleton */}
      <div className="h-[400px] rounded-[32px] bg-gray-200/60 dark:bg-gray-800/60 animate-pulse border border-white/20" />
    </div>
  );
}
