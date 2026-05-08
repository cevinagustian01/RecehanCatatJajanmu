"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { syncUser } from "@/lib/sync-user";

export async function getBudgetsWithSpent() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];

    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return [];

    const budgets = await prisma.budget.findMany({
      where: { userId: localUserId },
      include: {
        category: true
      },
      orderBy: { created_at: 'desc' }
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const expenses = await prisma.transaction.findMany({
      where: {
        type: { in: ["EXPENSE", "expense", "Expense"] },
        created_at: { gte: startOfMonth, lte: endOfMonth },
        category: { userId: localUserId }
      },
      include: {
        category: true
      }
    });

    const spentMap = new Map<string, number>();
    expenses.forEach(tx => {
      const catName = tx.category?.name || "Uncategorized";
      const existing = spentMap.get(catName) || 0;
      spentMap.set(catName, existing + tx.amount);
    });

    const result = budgets.map(b => ({
      id: b.id,
      category: b.category.name,
      limit: b.limitAmount,
      spent: spentMap.get(b.category.name) || 0,
      icon: b.icon || "🎯",
    }));

    return result;
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return [];
  }
}

export async function upsertBudget(data: { 
  id?: string;
  categoryId: string; // can be UUID OR a category name (UI sometimes passes name)
  limitAmount: number | string; 
  icon?: string;
}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, message: "Unauthenticated" };

    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;

    // Wallet/Transaction/Budget FK needs local User.id (UUID) not Clerk userId
    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;

    if (!localUserId) {
      return { success: false, message: "User sync failed" };
    }

    // Amount: normalize from UI string/number to a Float
    const amountRaw =
      typeof data.limitAmount === "string" ? data.limitAmount : String(data.limitAmount ?? "");
    const amountNum = Number(amountRaw.replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(amountNum)) {
      return { success: false, message: "Invalid limit amount" };
    }

    let realCategoryId = data.categoryId;

    // Determine if categoryId is a UUID; otherwise treat as a category name.
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(data.categoryId);

    if (!isUUID) {
      const categoryName = data.categoryId;

      let category = await prisma.category.findFirst({
        where: {
          userId: localUserId,
          name: { equals: categoryName, mode: "insensitive" }
        }
      });

      // AUTO-CREATE CATEGORY
      if (!category) {
        category = await prisma.category.create({
          data: {
            userId: localUserId,
            name: categoryName,
            icon: data.icon || "🎯",
            type: "EXPENSE"
          }
        });
      }

      realCategoryId = category.id;
    } else {
      // If a UUID was provided but category doesn't exist for this user, create it defensively.
      const categoryExists = await prisma.category.findFirst({
        where: { id: realCategoryId, userId: localUserId }
      });

      if (!categoryExists) {
        // We don't know the name here, so we can’t reliably recreate.
        // Best effort: fail with clear message.
        return { success: false, message: "Category not found for this user" };
      }
    }

    // UNIQUE CONSTRAINT: @@unique([userId, categoryId])
    // Prisma generates compound unique input as userId_categoryId
    await prisma.budget.upsert({
      where: {
        userId_categoryId: {
          userId: localUserId,
          categoryId: realCategoryId
        }
      },
      update: {
        limitAmount: amountNum,
        categoryId: realCategoryId
      },
      create: {
        userId: localUserId,
        categoryId: realCategoryId,
        limitAmount: amountNum,
        icon: data.icon || "🎯",
        period: "monthly"
      }
    });

    revalidatePath("/budget");
    revalidatePath("/");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("BUDGET_ERROR:", error);
    return { success: false, message: "Failed to save budget" };
  }
}

export async function deleteBudget(id: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, message: "Unauthenticated" };
    }

    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;

    if (!localUserId) {
      return { success: false, message: "User sync failed" };
    }

    await prisma.budget.delete({
      where: { id, userId: localUserId }
    });
    
    revalidatePath("/budget");
    revalidatePath("/");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return { success: false, message: "Failed to delete budget" };
  }
}