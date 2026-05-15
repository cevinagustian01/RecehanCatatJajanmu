import prisma from "@/lib/prisma";

export async function syncUser(authUserId: string, email: string, data?: { displayName?: string, avatarUrl?: string }) {
  if (!authUserId || !email) return null;

  // Ensure this is idempotent under concurrent requests
  const upserted = await prisma.user.upsert({
    where: { auth_user_id: authUserId },
    update: { 
      email,
      ...(data?.displayName && { displayName: data.displayName }),
      ...(data?.avatarUrl && { avatarUrl: data.avatarUrl }),
    },
    create: { 
      auth_user_id: authUserId, 
      email,
      displayName: data?.displayName || "",
      avatarUrl: data?.avatarUrl || ""
    },
  });

  // If there is already a row with the same email but different auth_user_id,
  // we prefer the upserted row (by auth_user_id). This prevents FK mismatches.
  return upserted;
}
