import prisma from "@/lib/prisma";

export async function syncUser(clerkId: string, email: string, data?: { displayName?: string, avatarUrl?: string }) {
  if (!clerkId || !email) return null;

  // Ensure this is idempotent under concurrent requests
  const upserted = await prisma.user.upsert({
    where: { clerk_id: clerkId },
    update: { 
      email,
      ...(data?.displayName && { displayName: data.displayName }),
      ...(data?.avatarUrl && { avatarUrl: data.avatarUrl }),
    },
    create: { 
      clerk_id: clerkId, 
      email,
      displayName: data?.displayName || "",
      avatarUrl: data?.avatarUrl || ""
    },
  });

  // If there is already a row with the same email but different clerk_id,
  // we prefer the upserted row (by clerk_id). This prevents FK mismatches.
  return upserted;
}
