"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function addWallet(data: { name: string, initialBalance: number }) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
       user = await prisma.user.create({
         data: {
           telegram_id: "demo_user_" + Date.now(),
         }
       });
    }

    await prisma.wallet.create({
      data: {
        userId: user.id,
        wallet_name: data.name,
        current_balance: data.initialBalance
      }
    });

    revalidatePath("/wallet");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding wallet:", error);
    return { success: false, message: "Server error" };
  }
}

export async function updateWallet(id: string, name: string) {
  try {
    await prisma.wallet.update({
      where: { id },
      data: { wallet_name: name }
    });
    
    revalidatePath("/wallet");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error updating wallet" };
  }
}

export async function deleteWallet(id: string) {
  try {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { walletId: id } }),
      prisma.wallet.delete({ where: { id } })
    ]);
    
    revalidatePath("/wallet");
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error deleting wallet" };
  }
}
