export default function BudgetLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200/60 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200/60 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[200px] rounded-[28px] bg-gray-200/60 animate-pulse border border-white/20" />
        ))}
      </div>
    </div>
  );
}
