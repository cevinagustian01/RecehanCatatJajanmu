export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      <div>
        <div className="h-9 w-36 bg-gray-200/60 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-64 bg-gray-200/60 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[100px] rounded-[20px] bg-gray-200/60 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-[400px] rounded-[28px] bg-gray-200/60 animate-pulse" />
        <div className="lg:col-span-2 h-[400px] rounded-[28px] bg-gray-200/60 animate-pulse" />
      </div>
    </div>
  );
}
