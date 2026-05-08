"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete user" };
  }
}

export async function updateUserRole(id: string, role: "USER" | "ADMIN") {
  try {
    await prisma.user.update({
      where: { id },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update role" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/admin/transactions");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete transaction" };
  }
}
