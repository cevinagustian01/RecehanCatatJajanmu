"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/sync-user";

export async function getWallets() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return [];

    // Mengambil data sesuai userId dari Supabase Auth
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
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    
    if (!userId) {
      return { success: false, message: "Kamu harus login dulu bos!" };
    }

    const email = authUser?.email;

    // Ensure User row exists locally to prevent P2003
    const synced = email ? await syncUser(userId, email) : null;

    const walletName = data.wallet_name ?? data.name;
    if (!walletName) {
      return { success: false, message: "Missing wallet name" };
    }

    await prisma.wallet.create({
      data: {
        // wallet.userId must reference local User.id (UUID)
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