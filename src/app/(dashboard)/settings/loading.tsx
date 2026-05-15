export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200/60 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200/60 rounded-md animate-pulse" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[200px] rounded-[28px] bg-gray-200/60 animate-pulse border border-white/20" />
        ))}
      </div>
    </div>
  );
}
