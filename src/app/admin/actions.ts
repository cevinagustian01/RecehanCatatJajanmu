"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getMyRole() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return "USER";
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { role: true },
    });
    return dbUser?.role || "USER";
  } catch {
    return "USER";
  }
}

export async function deleteUser(id: string) {
  try {
    // Hapus semua data terkait sebelum delete user (foreign key constraint)
    const wallets = await prisma.wallet.findMany({ where: { userId: id }, select: { id: true } });
    const walletIds = wallets.map((w) => w.id);

    if (walletIds.length > 0) {
      await prisma.transaction.deleteMany({ where: { walletId: { in: walletIds } } });
      await prisma.wallet.deleteMany({ where: { userId: id } });
    }

    await prisma.budget.deleteMany({ where: { userId: id } });
    await prisma.category.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user — masih ada data terkait yang tidak bisa dihapus" };
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

export async function addUser(data: { email: string; password: string; role: "USER" | "ADMIN"; displayName?: string }) {
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { displayName: data.displayName || data.email.split("@")[0] } },
    });

    if (error) {
      const msg = error.message;
      if (error.code === "over_email_send_rate_limit" || msg.includes("rate limit")) {
        return { success: false, message: "Batas pengiriman email tercapai, silakan coba lagi nanti" };
      }
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        const existingLocal = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingLocal) {
          await prisma.user.update({
            where: { id: existingLocal.id },
            data: { role: data.role, displayName: data.displayName || existingLocal.displayName },
          });
          revalidatePath("/admin/users");
          return { success: true, message: "Email sudah terdaftar — role diperbarui" };
        }
        return { success: false, message: "Email sudah terdaftar di Supabase tapi belum ada di database lokal" };
      }
      return { success: false, message: msg };
    }

    const authUserId = authData.user?.id;
    if (!authUserId) {
      return { success: false, message: "Gagal mendapat user ID dari Supabase" };
    }

    await prisma.user.create({
      data: {
        auth_user_id: authUserId,
        email: data.email,
        role: data.role,
        displayName: data.displayName || data.email.split("@")[0],
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User berhasil dibuat" };
  } catch (error: any) {
    console.error("Add user error:", error);
    return { success: false, message: error.message || "Gagal menambah user" };
  }
}
