export default function BudgetSettingsLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="h-8 w-48 bg-gray-200/60 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-200/60 rounded-md animate-pulse mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[100px] rounded-[20px] bg-gray-200/60 animate-pulse border border-white/20" />
        ))}
      </div>
    </div>
  );
}
