"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";

export async function getWallets() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    // Mengambil data sesuai userId dari Clerk
    return await prisma.wallet.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    console.error("GET_WALLETS_ERROR:", error);
    return [];
  }
}

export async function createWallet(data: { name?: string; wallet_name?: string; balance: number }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, message: "Kamu harus login dulu bos!" };
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    // Ensure User row exists locally to prevent P2003
    const synced = email ? await syncUser(userId, email) : null;

    const walletName = data.wallet_name ?? data.name;
    if (!walletName) {
      return { success: false, message: "Missing wallet name" };
    }

    await prisma.wallet.create({
      data: {
        // wallet.userId must reference User.id (UUID), not Clerk userId
        userId: synced?.id ?? userId,
        wallet_name: walletName,
        balance: data.balance,
        cardType: "PRIMARY",
        type: "BANK"
      }
    });

    revalidatePath("/wallet");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("CREATE_WALLET_ERROR_LOG:", error);
    return { success: false, message: "Gagal membuat dompet. Cek terminal!" };
  }
}