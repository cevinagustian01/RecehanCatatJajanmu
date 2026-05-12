import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import BottomNav from "@/components/dashboard/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FBFBFD] dark:bg-black selection:bg-[#007AFF]/30 selection:text-black">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-[260px] w-full max-w-full overflow-hidden">
        <Header />
        <main className="flex-1 px-4 py-6 pb-32 md:px-8 md:py-8 md:pb-12 lg:px-12 lg:py-10 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
