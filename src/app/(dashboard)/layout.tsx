import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] selection:bg-[#007AFF]/30 selection:text-black">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-[260px] w-full max-w-full overflow-hidden">
        <Header />
        <main className="flex-1 p-8 pb-24 md:p-12 md:pb-12 overflow-y-auto w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
