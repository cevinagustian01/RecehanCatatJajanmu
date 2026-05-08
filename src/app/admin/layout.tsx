import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // 1. Kalau belum login, lempar ke login
  if (!user) {
    redirect("/sign-in");
  }

  // 2. Cek database buat mastiin role lu
  const dbUser = await prisma.user.findUnique({
    where: { clerk_id: user.id },
    select: { role: true },
  });

  console.log("[ADMIN LAYOUT] currentUserId:", user?.id, "dbUserRole:", dbUser?.role, "dbUserExists:", Boolean(dbUser));

  // 3. Kalau di DB bukan ADMIN, lempar balik ke dashboard
  if (dbUser?.role !== "ADMIN") {
    console.log("Akses ditolak: Role anda adalah", dbUser?.role);
    redirect("/");
  }

  return <>{children}</>;
}