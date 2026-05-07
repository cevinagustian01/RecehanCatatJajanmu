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

export async function addTransaction(data: { walletId: string, amount: number, type: "INCOME" | "EXPENSE", category: string, merchant: string }) {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { id: data.walletId } });
    if (!wallet) return { success: false, message: "Wallet not found" };

    const newBalance = data.type === "INCOME" 
      ? wallet.current_balance + data.amount 
      : wallet.current_balance - data.amount;

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          walletId: data.walletId,
          amount: data.amount,
          type: data.type,
          category: data.category,
          merchant: data.merchant,
        }
      }),
      prisma.wallet.update({
        where: { id: data.walletId },
        data: { current_balance: newBalance }
      })
    ]);

    revalidatePath("/");
    revalidatePath("/analytics");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, message: "Server error" };
  }
}

export async function getWalletsList() {
  try {
    const wallets = await prisma.wallet.findMany();
    return wallets.map(w => ({ id: w.id, name: w.wallet_name }));
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return [];
  }
}

export async function updateTransactionDetails(id: string, data: { amount: number, type: "INCOME" | "EXPENSE", category: string, merchant: string, walletId: string }) {
  try {
    const tx = await prisma.transaction.findUnique({ where: { id }, include: { wallet: true } });
    if (!tx) return { success: false, message: "Transaction not found" };

    const ops = [];

    const reversedOldBalance = String(tx.type).toUpperCase() === 'INCOME' 
      ? tx.wallet.current_balance - tx.amount
      : tx.wallet.current_balance + tx.amount;
    
    if (tx.walletId === data.walletId) {
      const finalBalance = data.type === 'INCOME'
        ? reversedOldBalance + data.amount
        : reversedOldBalance - data.amount;
        
      ops.push(prisma.wallet.update({ where: { id: data.walletId }, data: { current_balance: finalBalance } }));
    } else {
      ops.push(prisma.wallet.update({ where: { id: tx.walletId }, data: { current_balance: reversedOldBalance } }));
      
      const newWallet = await prisma.wallet.findUnique({ where: { id: data.walletId } });
      if (newWallet) {
        const finalNewBalance = data.type === 'INCOME'
          ? newWallet.current_balance + data.amount
          : newWallet.current_balance - data.amount;
        ops.push(prisma.wallet.update({ where: { id: data.walletId }, data: { current_balance: finalNewBalance } }));
      }
    }

    ops.push(prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        merchant: data.merchant,
        walletId: data.walletId
      }
    }));

    await prisma.$transaction(ops);

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/analytics");
    revalidatePath("/wallet");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, message: "Error updating transaction" };
  }
}
