import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-[260px] w-full max-w-full overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
