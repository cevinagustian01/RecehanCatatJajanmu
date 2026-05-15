"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { syncUser } from "@/lib/sync-user";

export async function getTransactions() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return [];

    const email = authUser?.email;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return [];

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: { userId: localUserId }
      },
      include: {
        wallet: true,
        category: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return transactions.map(tx => ({
      id: tx.id,
      name: tx.merchant,
      category: tx.category?.name || "Uncategorized",
      wallet: tx.wallet.wallet_name,
      amount: tx.amount,
      type: tx.type.toLowerCase() === 'income' ? 'credit' : 'debit',
      date: tx.created_at,
      status: 'completed',
    }));
  } catch (error) {
    console.error("TRANSACTION PRISMA ERROR:", error);
    return [];
  }
}

export async function deleteTransaction(txId: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { wallet: true }
    });

    if (!tx) return { success: false, message: "Transaction not found" };

    // Reverse the balance operation
    const newBalance = String(tx.type).toUpperCase() === 'INCOME'
      ? tx.wallet.balance - tx.amount
      : tx.wallet.balance + tx.amount;

    // Delete transaction and update wallet balance atomically
    await prisma.$transaction([
      prisma.transaction.delete({ where: { id: txId } }),
      prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: newBalance }
      })
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("TRANSACTION PRISMA ERROR:", error);
    return { success: false, message: "Error deleting transaction" };
  }
}

export async function addTransaction(data: {
  walletId: string,
  amount: number,
  type: "INCOME" | "EXPENSE",
  category: string,
  merchant: string,
  created_at: string | Date
}) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) {
      return { success: false, message: "Unauthenticated" };
    }

    const email = authUser?.email;

    // Wallet.userId references local User.id (UUID)
    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) {
      return { success: false, message: "User sync failed" };
    }

    // Validate amount
    // Credit check
    if (synced && synced.credits <= 0) {
      return { success: false, message: "Kredit Anda habis. Silakan upgrade plan untuk menambah transaksi." };
    }

    const amountNum = Number(data.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return { success: false, message: "Invalid amount" };
    }

    // Verify wallet exists and belongs to user (local UUID)
    const wallet = await prisma.wallet.findFirst({
      where: { id: data.walletId, userId: localUserId }
    });

    if (!wallet) {
      return { success: false, message: "Dompet tidak ditemukan. Silakan buat dompet dulu di menu My Wallet." };
    }

    // Resolve category: if category is a name, find or create it
    let categoryId: string;

    // Check if data.category is a UUID or a name
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.category);

    if (isUUID) {
      categoryId = data.category;
    } else {
      // Find or create category by name (local UUID)
      let category = await prisma.category.findFirst({
        where: { userId: localUserId, name: { equals: data.category, mode: 'insensitive' } }
      });

      if (!category) {
        const defaultCat = DEFAULT_CATEGORIES.find(d => d.name.toLowerCase() === data.category.toLowerCase());
        category = await prisma.category.create({
          data: {
            userId: localUserId,
            name: data.category,
            icon: defaultCat?.icon || "🎯",
            type: data.type === "INCOME" ? "INCOME" : "EXPENSE"
          }
        });
      }
      categoryId = category.id;
    }

    const newBalance = data.type === "INCOME"
      ? wallet.balance + amountNum
      : wallet.balance - amountNum;

    const createdAt = new Date(data.created_at);

    if (Number.isNaN(createdAt.getTime())) {
      return { success: false, message: "Invalid transaction date" };
    }

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          walletId: data.walletId,
          amount: amountNum,
          type: data.type,
          categoryId: categoryId,
          merchant: data.merchant,
          created_at: createdAt,
        }
      }),

      prisma.wallet.update({
        where: { id: data.walletId },
        data: { balance: newBalance }
      })
    ]);

    revalidatePath("/");
    revalidatePath("/analytics");
    try {
      await (prisma.user as any).update({
        where: { id: localUserId },
        data: { credits: { decrement: 1 } }
      });
    } catch (e) {}
    return { success: true };
  } catch (error) {
    console.error("TRANSACTION PRISMA ERROR:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error(error);
    }
    let message = "Gagal nyimpen transaksi";
    if (error instanceof Error) {
      message = error.message;
      if (message.includes("credits")) {
        message = "Kredit tidak ditemukan pada model User. Silakan jalankan 'npx prisma generate'.";
      }
    }
    return { success: false, message };
  }
}

export async function getWalletsList() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return [];

    const email = authUser?.email;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return [];

    const wallets = await prisma.wallet.findMany({
      where: { userId: localUserId },
      orderBy: { created_at: 'desc' },
      select: { id: true, wallet_name: true, type: true }
    });

    return wallets.map(w => ({ id: w.id, name: w.wallet_name, type: w.type }));
  } catch (error) {
    console.error("TRANSACTION PRISMA ERROR:", error);
    return [];
  }
}

export async function updateTransactionDetails(
  id: string,
  data: {
    amount: number,
    type: "INCOME" | "EXPENSE",
    category: string,
    merchant: string,
    walletId: string,
    created_at: string | Date
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true, category: true }
    });

    if (!tx) return { success: false, message: "Transaction not found" };

    // Verify the transaction belongs to the user
    const wallet = await prisma.wallet.findFirst({
      where: { id: tx.walletId, userId }
    });

    if (!wallet) {
      return { success: false, message: " Wallet not found" };
    }

    const ops = [];

    // Calculate balance adjustments
    const reversedOldBalance = String(tx.type).toUpperCase() === 'INCOME'
      ? tx.wallet.balance - tx.amount
      : tx.wallet.balance + tx.amount;

    if (tx.walletId === data.walletId) {
      const finalBalance = data.type === 'INCOME'
        ? reversedOldBalance + data.amount
        : reversedOldBalance - data.amount;

      ops.push(prisma.wallet.update({
        where: { id: data.walletId },
        data: { balance: finalBalance }
      }));
    } else {
      // Update old wallet
      ops.push(prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: reversedOldBalance }
      }));

      // Update new wallet
      const newWallet = await prisma.wallet.findFirst({
        where: { id: data.walletId, userId }
      });

      if (!newWallet) {
        return { success: false, message: "Dompet tidak ditemukan. Silakan buat dompet dulu di menu My Wallet." };
      }

      const finalNewBalance = data.type === 'INCOME'
        ? newWallet.balance + data.amount
        : newWallet.balance - data.amount;

      ops.push(prisma.wallet.update({
        where: { id: data.walletId },
        data: { balance: finalNewBalance }
      }));
    }

    // Resolve category ID
    let categoryId: string;
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.category);

    if (isUUID) {
      categoryId = data.category;
    } else {
      let category = await prisma.category.findFirst({
        where: { userId, name: { equals: data.category, mode: 'insensitive' } }
      });

      if (!category) {
        const defaultCat = DEFAULT_CATEGORIES.find(d => d.name.toLowerCase() === data.category.toLowerCase());
        category = await prisma.category.create({
          data: {
            userId,
            name: data.category,
            icon: defaultCat?.icon || "🎯",
            type: data.type === "INCOME" ? "INCOME" : "EXPENSE"
          }
        });
      }
      categoryId = category.id;
    }

    const createdAt = new Date(data.created_at);

    if (Number.isNaN(createdAt.getTime())) {
      return { success: false, message: "Invalid transaction date" };
    }

    ops.push(prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        type: data.type,
        categoryId: categoryId,
        merchant: data.merchant,
        walletId: data.walletId,
        created_at: createdAt,
      }
    }));

    await prisma.$transaction(ops);

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/analytics");
    revalidatePath("/wallet");
    return { success: true };
  } catch (error) {
    console.error("TRANSACTION PRISMA ERROR:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return { success: false, message: "Error updating transaction" };
  }
}


export async function fetchTransactionsByDate(startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return { transactions: [], startDate, endDate };


    const email = authUser?.email;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return { transactions: [], startDate, endDate };

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: { userId: localUserId },
        created_at: { gte: startDate, lte: endDate }
      },
      include: {
        wallet: true,
        category: true
      },
      orderBy: { created_at: 'asc' }
    });


    const mappedTransactions = transactions.map(tx => ({
      id: tx.id,
      name: tx.merchant,
      category: tx.category?.name || "Uncategorized",
      wallet: tx.wallet.wallet_name,
      amount: tx.amount,
      type: tx.type.toLowerCase() === 'income' ? 'credit' : 'debit',
      date: tx.created_at,
      status: 'completed',
    }));

    return { transactions: mappedTransactions, startDate, endDate };
  } catch (error) {
    console.error("FETCH TRANSACTIONS BY DATE ERROR:", error);
    return { transactions: [], startDate, endDate };
  }
}


export type ChartPeriod = "weekly" | "monthly" | "yearly";

export interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
}

export async function fetchChartData(period: ChartPeriod) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return [];

    const email = authUser?.email;
    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "weekly") {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === "monthly") {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // yearly - current year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: { userId: localUserId },
        created_at: { gte: startDate, lte: endDate }
      },
      include: { wallet: true, category: true },
      orderBy: { created_at: 'asc' }
    });

    // Aggregate based on period
    const dataMap = new Map<string, { income: number; expenses: number }>();

    if (period === "yearly") {
      // Group by month
      for (let m = 0; m < 12; m++) {
        const monthName = new Date(2024, m, 1).toLocaleDateString('en-US', { month: 'short' });
        dataMap.set(monthName, { income: 0, expenses: 0 });
      }
      transactions.forEach(tx => {
        const monthName = tx.created_at.toLocaleDateString('en-US', { month: 'short' });
        const entry = dataMap.get(monthName)!;
        if (String(tx.type).toUpperCase() === 'INCOME') entry.income += tx.amount;
        else entry.expenses += tx.amount;
      });
    } else if (period === "monthly") {
      // Group by day of month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        dataMap.set(String(d), { income: 0, expenses: 0 });
      }
      transactions.forEach(tx => {
        const dayNum = tx.created_at.getDate();
        const entry = dataMap.get(String(dayNum));
        if (entry) {
          if (String(tx.type).toUpperCase() === 'INCOME') entry.income += tx.amount;
          else entry.expenses += tx.amount;
        }
      });
    } else {
      // Weekly - group by day of week
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayNames.forEach(day => {
        dataMap.set(day, { income: 0, expenses: 0 });
      });
      transactions.forEach(tx => {
        const dayName = tx.created_at.toLocaleDateString('en-US', { weekday: 'short' });
        const entry = dataMap.get(dayName);
        if (entry) {
          if (String(tx.type).toUpperCase() === 'INCOME') entry.income += tx.amount;
          else entry.expenses += tx.amount;
        }
      });
    }

    return Array.from(dataMap.entries()).map(([name, values]) => ({
      name,
      income: values.income,
      expenses: values.expenses
    }));
  } catch (error) {
    console.error("FETCH CHART DATA ERROR:", error);
    return [];
  }
}
