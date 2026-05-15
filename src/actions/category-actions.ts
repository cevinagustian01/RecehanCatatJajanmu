"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) return [];

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });

    return categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || "🎯",
      type: c.type,
    }));
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return [];
  }
}

export async function addCustomCategory(data: { name: string; icon?: string; type?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    // Check if category name already exists for this user
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: { equals: data.name.trim(), mode: "insensitive" }
      }
    });
    
    if (existing) {
      return { success: false, message: "Category already exists" };
    }

    await prisma.category.create({
      data: {
        userId,
        name: data.name.trim(),
        icon: data.icon || "🎯",
        type: data.type || "EXPENSE",
      }
    });

    revalidatePath("/");
    revalidatePath("/budget");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return { success: false, message: "Failed to add category" };
  }
} // <-- TADI KURUNG INI ILANG

export async function deleteCategory(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return { success: false, message: "Unauthenticated" };
    }

    // First, get the category to check if it's used in budgets
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Ensure user owns this category
    if (category.userId !== userId) {
      return { success: false, message: "Not authorized" };
    }

    // Check if any budgets reference this category
    const budgetCount = await prisma.budget.count({
      where: { categoryId: id }
    });

    if (budgetCount > 0) {
      return { success: false, message: "Cannot delete category used in budgets" };
    }

    // Check if any transactions reference this category
    const txCount = await prisma.transaction.count({
      where: { categoryId: id }
    });

    if (txCount > 0) {
      return { success: false, message: "Cannot delete category used in transactions" };
    }

    await prisma.category.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/budget");
    revalidatePath("/settings/budget");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return { success: false, message: "Failed to delete category" };
  }
}