import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WalletCard from "@/components/dashboard/WalletCard";
import CashflowChart from "@/components/dashboard/CashflowChart";
import PaymentHistory from "@/components/dashboard/PaymentHistory";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-[260px] flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-8">
          {/* Top row: Wallet + Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WalletCard />
            <CashflowChart />
          </div>

          {/* Payment History */}
          <div className="mt-6">
            <PaymentHistory />
          </div>
        </main>
      </div>
    </div>
  );
}
