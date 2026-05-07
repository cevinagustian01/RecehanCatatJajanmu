"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function getBudgets() {
  try {
    return await prisma.budget.findMany({ orderBy: { category: 'asc' } });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }
}

export async function upsertBudget(data: { category: string, limitAmount: number }) {
  try {
    await prisma.budget.upsert({
      where: { category: data.category.toLowerCase().trim() },
      update: { limitAmount: data.limitAmount },
      create: {
        category: data.category.toLowerCase().trim(),
        limitAmount: data.limitAmount,
        period: "monthly"
      }
    });

    revalidatePath("/");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("Error upserting budget:", error);
    return { success: false, message: "Server error" };
  }
}

export async function deleteBudget(id: string) {
  try {
    await prisma.budget.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("Error deleting budget:", error);
    return { success: false, message: "Server error" };
  }
}
