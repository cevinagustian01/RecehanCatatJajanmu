import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categoriesToNormalize = ["Makanan", "Food & Beverage", "Food & Drink", "food"];
    const normalizedName = "Food";

    // Transactions are linked to Categories via categoryId (Category is per-user).
    const transactions = await prisma.transaction.findMany({
      where: {
        category: {
          name: { in: categoriesToNormalize, mode: "insensitive" },
        },
      },
      include: {
        category: {
          select: { id: true, userId: true, name: true },
        },
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No categories matched normalization filters.",
        updatedCount: 0,
      });
    }

    // Ensure we have a target "Food" category for each affected user.
    const affectedUserIds = Array.from(
      new Set(transactions.map((t) => t.category?.userId).filter(Boolean) as string[])
    );

    const existingFoodCategories = await prisma.category.findMany({
      where: {
        userId: { in: affectedUserIds },
        name: { equals: normalizedName, mode: "insensitive" },
      },
      select: { id: true, userId: true },
    });

    const foodCategoryByUserId = new Map<string, string>(
      existingFoodCategories.map((c) => [c.userId, c.id])
    );

    // Create missing "Food" categories.
    await Promise.all(
      affectedUserIds.map(async (userId) => {
        if (foodCategoryByUserId.has(userId)) return;

        const created = await prisma.category.create({
          data: {
            userId,
            name: normalizedName,
            icon: "🎯",
            type: "EXPENSE",
          },
          select: { id: true, userId: true },
        });

        foodCategoryByUserId.set(created.userId, created.id);
      })
    );

    // Update transactions to point at the normalized categoryId for their user.
    const updateResults = await Promise.all(
      transactions.map((t) => {
        const userId = t.category?.userId;
        const foodCategoryId = userCategorySafeGet(foodCategoryByUserId, userId);
        return prisma.transaction.update({
          where: { id: t.id },
          data: { categoryId: foodCategoryId },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "Categories normalized successfully.",
      updatedCount: updateResults.length,
    });
  } catch (error: any) {
    console.error("Error normalizing categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to normalize categories." },
      { status: 500 }
    );
  }
}

function userCategorySafeGet(map: Map<string, string>, userId: string | undefined) {
  if (!userId) throw new Error("Transaction category userId missing");
  const v = map.get(userId);
  if (!v) throw new Error(`Missing normalized category for userId=${userId}`);
  return v;
}
