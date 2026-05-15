export default function LandingLoading() {
  return (
    <main className="min-h-screen w-full bg-white overflow-x-hidden">
      <header className="sticky top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-14 rounded-md bg-gray-200 animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center px-5 pt-20 pb-32 md:pt-32 md:pb-44">
        <div className="h-96 w-full max-w-3xl rounded-[28px] bg-gray-100 animate-pulse" />
      </section>
    </main>
  );
}
