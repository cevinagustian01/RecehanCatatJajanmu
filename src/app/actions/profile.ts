"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/sync-user";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return null;

    const email = authUser?.email;
    const name = authUser?.user_metadata?.displayName || authUser?.user_metadata?.full_name || email?.split("@")[0] || "";
    const avatar = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null;

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
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return { success: false, message: "Unauthenticated" };

    const email = authUser?.email;

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
