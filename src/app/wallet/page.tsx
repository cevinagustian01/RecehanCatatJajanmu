import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import prisma from "@/lib/prisma";
import WalletClient from "./WalletClient";

export default async function WalletPage() {
  const wallets = await prisma.wallet.findMany({
    include: {
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="md:ml-[260px] flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 w-full max-w-full">
          <WalletClient initialWallets={wallets} />
        </main>
      </div>
    </div>
  );
}
