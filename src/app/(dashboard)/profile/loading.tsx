export default function ProfileLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200/60 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200/60 rounded-md animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="h-24 w-24 rounded-full bg-gray-200/60 animate-pulse" />
        <div className="h-6 w-40 bg-gray-200/60 rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-gray-200/60 rounded-md animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[80px] rounded-[20px] bg-gray-200/60 animate-pulse border border-white/20" />
        ))}
      </div>
    </div>
  );
}
