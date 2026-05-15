import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import WalletClient from "./WalletClient";
import { syncUser } from "@/lib/sync-user";

export const revalidate = 30;

export default async function WalletPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  const synced = userId && email ? await syncUser(userId, email) : null;
  const localUserId = synced?.id ?? null;

  const wallets = await prisma.wallet.findMany({
    where: localUserId ? { userId: localUserId } : undefined,
    include: {
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  return <WalletClient initialWallets={wallets} />;
}
