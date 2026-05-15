import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import WalletClient from "./WalletClient";
import { syncUser } from "@/lib/sync-user";

export const revalidate = 30;

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const userId = authUser?.id;
  const email = authUser?.email;

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
