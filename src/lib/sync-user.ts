import prisma from "@/lib/prisma";

export async function syncUser(clerkId: string, email: string) {
  if (!clerkId || !email) return null;

  // Ensure this is idempotent under concurrent requests (avoid Unique constraint on clerk_id)
  const upserted = await prisma.user.upsert({
    where: { clerk_id: clerkId },
    update: { email },
    create: { clerk_id: clerkId, email },
  });

  // If there is already a row with the same email but different clerk_id,
  // we prefer the upserted row (by clerk_id). This prevents FK mismatches.
  return upserted;
}
