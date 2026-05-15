export default function RootLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FBFBFD] dark:bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white" />
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    </div>
  );
}
