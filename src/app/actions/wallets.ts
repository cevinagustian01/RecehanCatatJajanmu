"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";

export async function getWallets() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' }
    });
    return wallets;
  } catch (error) {
    console.error("PRISMA ERROR IN GETWALLETS:", error);
    return [];
  }
}

export async function getWalletsList() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
      select: { id: true, wallet_name: true }
    });
    return wallets.map(w => ({ id: w.id, name: w.wallet_name }));
  } catch (error) {
    console.error("PRISMA ERROR IN GETWALLETSLIST:", error);
    return [];
  }
}

export async function addWallet(data: {
  name: string,
  balance: number,
  color?: string | null,
  cardNumber?: string | null,
  expiryDate?: string | null,
  cardHolder?: string | null,
  cardType?: string | null,
  type?: string | null
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    const synced = email ? await syncUser(userId, email) : null;

    await prisma.wallet.create({
      data: {
        // IMPORTANT: wallet.userId must reference User.id (UUID), not Clerk userId
        userId: synced?.id ?? userId,
        wallet_name: data.name,
        balance: data.balance,
        color: data.color,
        cardNumber: data.cardNumber,
        expiryDate: data.expiryDate,
        cardHolder: data.cardHolder,
        cardType: data.cardType || "SECONDARY",
        type: data.type || "BANK",
      }
    });

    revalidatePath("/wallet");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR IN ADDWALLET:", error);
    return { success: false, message: "Failed to add wallet" };
  }
}

export async function updateWallet(id: string, data: {
  name?: string,
  balance?: number,
  color?: string | null,
  cardNumber?: string | null,
  expiryDate?: string | null,
  cardHolder?: string | null,
  cardType?: string | null,
  type?: string | null
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const synced = email ? await syncUser(userId, email) : null;
    const localUserId = synced?.id ?? userId;

    // Verify ownership
    const existing = await prisma.wallet.findFirst({
      where: { id, userId: localUserId }
    });
    if (!existing) {
      return { success: false, message: "Wallet not found" };
    }

    await prisma.wallet.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { wallet_name: data.name }),
        ...(data.balance !== undefined && { balance: data.balance }),
        ...(data.color != null && { color: data.color }),
        ...(data.cardNumber != null && { cardNumber: data.cardNumber }),
        ...(data.expiryDate != null && { expiryDate: data.expiryDate }),
        ...(data.cardHolder != null && { cardHolder: data.cardHolder }),
        ...(data.cardType != null && { cardType: data.cardType }),
        ...(data.type != null && { type: data.type }),
      }
    });

    revalidatePath("/wallet");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR IN UPDATEWALLET:", error);
    return { success: false, message: "Error updating wallet" };
  }
}

export async function deleteWallet(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    const synced = email ? await syncUser(userId, email) : null;
    const localUserId = synced?.id ?? userId;

    // Verify ownership before deleting
    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: localUserId }
    });
    if (!wallet) {
      return { success: false, message: "Wallet not found" };
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { walletId: id } }),
      prisma.wallet.delete({ where: { id } })
    ]);
    
    revalidatePath("/wallet");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR IN DELETEWALLET:", error);
    return { success: false, message: "Error deleting wallet" };
  }
}
