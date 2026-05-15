import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 1. Kalau belum login, lempar ke halaman login admin
  if (!authUser) {
    redirect("/admin/login");
  }

  // 2. Sync user ke database lokal kalo belum ada
  const email = authUser.email;
  const name = authUser.user_metadata?.displayName || authUser.user_metadata?.full_name || email?.split("@")[0] || "";
  const synced = email ? await syncUser(authUser.id, email, { displayName: name }) : null;
  const localUserId = synced?.id;

  // 3. Cek role
  const dbUser = localUserId ? await prisma.user.findUnique({
    where: { id: localUserId },
    select: { role: true },
  }) : null;

  console.log("[ADMIN LAYOUT] currentUserId:", authUser?.id, "dbUserRole:", dbUser?.role, "dbUserExists:", Boolean(dbUser));

  // 4. Kalau di DB bukan ADMIN, lempar balik
  if (dbUser?.role !== "ADMIN") {
    console.log("Akses ditolak: Role anda adalah", dbUser?.role);
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#FBFBFD]">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
