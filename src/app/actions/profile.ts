"use server"

import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;
    const name = `${clerk?.firstName || ""} ${clerk?.lastName || ""}`.trim();
    const avatar = clerk?.imageUrl;

    const synced = email ? await syncUser(clerkUserId, email, { displayName: name, avatarUrl: avatar }) : null;
    const localUserId = synced?.id;
    if (!localUserId) return null;

    const user = await prisma.user.findUnique({
      where: { id: localUserId }
    });

    return user;
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return null;
  }
}

export async function updateProfile(data: {
  displayName?: string,
  phoneNumber?: string,
  connectWhatsApp?: boolean,
  connectTelegram?: boolean
}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, message: "Unauthenticated" };

    const clerk = await currentUser();
    const email = clerk?.emailAddresses?.[0]?.emailAddress;

    const synced = email ? await syncUser(clerkUserId, email) : null;
    const localUserId = synced?.id;
    if (!localUserId) return { success: false, message: "User sync failed" };

    await prisma.user.update({
      where: { id: localUserId },
      data
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return { success: false, message: "Error updating profile" };
  }
}
