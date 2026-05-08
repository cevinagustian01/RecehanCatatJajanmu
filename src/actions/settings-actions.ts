"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { syncUser } from "@/lib/sync-user";

type ActionResult<T = unknown> = { success: true; data: T } | { success: false; message: string };

function safeFirstEmail(clerk: Awaited<ReturnType<typeof currentUser>>) {
  return clerk?.emailAddresses?.[0]?.emailAddress;
}

async function getLocalUserId() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const clerk = await currentUser();
  const email = safeFirstEmail(clerk);
  const synced = email ? await syncUser(clerkUserId, email) : null;
  return synced?.id ?? null;
}

export async function getSettings(): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    const user = await prisma.user.findUnique({
      where: { id: localUserId },
    });

    return { success: true, data: user };
  } catch (e) {
    console.error("SETTINGS_ERROR(get):", e);
    return { success: false, message: "Failed to load settings" };
  }
}

export async function updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    await prisma.user.update({
      where: { id: localUserId },
      data: {
        displayName: data.displayName ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (e) {
    console.error("SETTINGS_ERROR(profile):", e);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function uploadAvatar(data: {
  displayName?: string;
  file: File;
}): Promise<ActionResult<{ avatarUrl: string }>> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    const { file } = data;

    const clerk = await currentUser();
    if (!clerk) return { success: false, message: "Unauthenticated" };

    // Upload to Clerk storage and sync across Clerk components.
    // Clerk typing may differ by version, so we cast.
    await (clerk as any).setProfileImage({ file });


    // Clerk profile image URL is exposed on the clerk user object.
    const avatarUrl =
      (clerk as any).imageUrl ??
      (clerk as any).profileImageUrl ??
      (clerk as any).profile_image_url ??
      null;

    if (!avatarUrl) {
      // Fallback: keep DB consistent only after we can read a URL.
      return { success: false, message: "Avatar uploaded but URL was not returned" };
    }

    await prisma.user.update({
      where: { id: localUserId },
      data: {
        displayName: data.displayName?.trim() || undefined,
        avatarUrl,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    revalidatePath("/settings");

    return { success: true, data: { avatarUrl } };
  } catch (e) {
    console.error("SETTINGS_ERROR(uploadAvatar):", e);
    return { success: false, message: "Failed to upload avatar" };
  }
}


export async function updateConnections(data: {
  connectWhatsApp: boolean;
  connectTelegram: boolean;
  phoneNumber?: string;
}): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    await prisma.user.update({
      where: { id: localUserId },
      data: {
        connectWhatsApp: data.connectWhatsApp,
        connectTelegram: data.connectTelegram,
        phoneNumber: data.phoneNumber ?? undefined,
      },
    });

    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (e) {
    console.error("SETTINGS_ERROR(connections):", e);
    return { success: false, message: "Failed to update connections" };
  }
}

export async function updateNotifications(data: {
  notifyTransactionAlerts: boolean;
  notifyWeeklyReports: boolean;
  notifyDailyReminders: boolean;
}): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    await prisma.user.update({
      where: { id: localUserId },
      data: {
        notifyTransactionAlerts: data.notifyTransactionAlerts,
        notifyWeeklyReports: data.notifyWeeklyReports,
        notifyDailyReminders: data.notifyDailyReminders,
      },
    });

    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (e) {
    console.error("SETTINGS_ERROR(notifications):", e);
    return { success: false, message: "Failed to update notifications" };
  }
}

export async function updatePaydayDate(paydayDateISO: string | null): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    const paydayDate = paydayDateISO ? new Date(paydayDateISO) : null;

    await prisma.user.update({
      where: { id: localUserId },
      data: { paydayDate },
    });

    revalidatePath("/settings");
    return { success: true, data: null };
  } catch (e) {
    console.error("SETTINGS_ERROR(paydayDate):", e);
    return { success: false, message: "Failed to update payday date" };
  }
}

function toCSV(rows: Record<string, unknown>[]) {
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  return lines.join("\n");
}

export async function backupWalletsAndTransactions(): Promise<ActionResult<{ json: string; csv: string }>> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    const wallets = await prisma.wallet.findMany({
      where: { userId: localUserId },
      orderBy: { created_at: "desc" },
    });

    const walletIds = wallets.map((w) => w.id);

    const transactions = walletIds.length
      ? await prisma.transaction.findMany({
          where: { walletId: { in: walletIds } },
          orderBy: { created_at: "desc" },
          include: { category: true },
        })
      : [];

    const payload = { wallets, transactions };

    const json = JSON.stringify(payload, null, 2);

    const csv = toCSV(
      transactions.map((t) => ({
        id: t.id,
        walletId: t.walletId,
        amount: t.amount,
        type: t.type,
        categoryId: t.categoryId ?? "",
        categoryName: t.category?.name ?? "",
        merchant: t.merchant,
        created_at: t.created_at,
      }))
    );

    return { success: true, data: { json, csv } };
  } catch (e) {
    console.error("SETTINGS_ERROR(backup):", e);
    return { success: false, message: "Backup failed" };
  }
}

export async function resetWalletsAndTransactions(): Promise<ActionResult> {
  try {
    const localUserId = await getLocalUserId();
    if (!localUserId) return { success: false, message: "Unauthenticated" };

    // Danger zone: delete transactions, then wallets
    await prisma.transaction.deleteMany({
      where: { wallet: { userId: localUserId } },
    });

    await prisma.wallet.deleteMany({
      where: { userId: localUserId },
    });

    revalidatePath("/settings");
    revalidatePath("/wallet");
    revalidatePath("/transactions");
    revalidatePath("/budget");
    return { success: true, data: null };
  } catch (e) {
    console.error("SETTINGS_ERROR(reset):", e);
    return { success: false, message: "Reset failed" };
  }
}
