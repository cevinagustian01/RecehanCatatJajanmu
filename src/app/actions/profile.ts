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

export async function updateAvatar(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const clerkUserId = authUser?.id;
    if (!clerkUserId) return { success: false, message: "Unauthenticated" };

    const file = formData.get("avatar") as File;
    if (!file) return { success: false, message: "Tidak ada file yang dipilih" };

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, message: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF" };
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, message: "Ukuran file maksimal 2MB" };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `avatar-${clerkUserId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("SUPABASE STORAGE UPLOAD ERROR:", uploadError);
      const msg = uploadError.message?.includes("row-level security")
        ? "Gagal upload: bucket avatars belum dikonfigurasi. Jalankan SQL di supabase/storage-policies.sql"
        : "Gagal mengupload gambar";
      return { success: false, message: msg };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (metadataError) {
      console.error("SUPABASE AUTH METADATA UPDATE ERROR:", metadataError);
      return { success: false, message: "Gagal memperbarui profil" };
    }

    const email = authUser?.email;
    const synced = email ? await syncUser(clerkUserId, email, { avatarUrl: publicUrl }) : null;
    const localUserId = synced?.id;
    if (!localUserId) return { success: false, message: "User sync failed" };

    await prisma.user.update({
      where: { id: localUserId },
      data: { avatarUrl: publicUrl },
    });

    revalidatePath("/profile");
    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("UPDATE AVATAR ERROR:", error);
    return { success: false, message: "Error updating avatar" };
  }
}

export async function saveOnboarding(data: {
  theme: string;
  language: string;
  currency: string;
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
      data: {
        theme: data.theme,
        language: data.language,
        currency: data.currency,
      },
    });

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        language: data.language,
        currency: data.currency,
      },
    });

    if (metadataError) {
      console.error("SUPABASE AUTH METADATA UPDATE ERROR:", metadataError);
    }

    return { success: true };
  } catch (error) {
    console.error("SAVE ONBOARDING ERROR:", error);
    return { success: false, message: "Gagal menyimpan preferensi" };
  }
}

export async function updateProfile(data: {
  displayName?: string,
  phoneNumber?: string,
  connectWhatsApp?: boolean,
  connectTelegram?: boolean,
  language?: string,
  currency?: string,
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
      data: {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        connectWhatsApp: data.connectWhatsApp,
        connectTelegram: data.connectTelegram,
        language: data.language,
        currency: data.currency,
      },
    });

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        displayName: data.displayName,
        language: data.language,
        currency: data.currency,
      },
    });

    if (metadataError) {
      console.error("SUPABASE AUTH METADATA UPDATE ERROR:", metadataError);
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return { success: false, message: "Error updating profile" };
  }
}
