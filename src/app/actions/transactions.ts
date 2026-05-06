"use server"

import prisma from "@/lib/prisma"

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
