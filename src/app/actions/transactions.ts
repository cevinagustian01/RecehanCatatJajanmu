"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        wallet: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Map the database model to the UI format required by PaymentHistory
    return transactions.map(tx => ({
      id: tx.id,
      name: tx.merchant,
      category: tx.category,
      wallet: tx.wallet.wallet_name,
      amount: tx.amount,
      type: tx.type.toLowerCase() === 'income' ? 'credit' : 'debit',
      date: tx.created_at,
      status: 'completed', // Defaults to completed since we don't have status in schema
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function deleteTransaction(txId: string) {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { wallet: true }
    });

    if (!tx) return { success: false, message: "Transaction not found" };

    // Reverse the balance operation
    const newBalance = String(tx.type).toUpperCase() === 'INCOME' 
      ? tx.wallet.current_balance - tx.amount
      : tx.wallet.current_balance + tx.amount;

    // Delete transaction and update wallet balance atomically
    await prisma.$transaction([
      prisma.transaction.delete({ where: { id: txId } }),
      prisma.wallet.update({
        where: { id: tx.walletId },
        data: { current_balance: newBalance }
      })
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, message: "Error deleting transaction" };
  }
}
