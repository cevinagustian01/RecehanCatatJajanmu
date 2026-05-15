import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  console.log("[ADMIN PAGE] currentUserId:", authUser?.id, "rendering admin dashboard");

  const usersCount = await prisma.user.count();
  const txCount = await prisma.transaction.count();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overview</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{usersCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Transactions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{txCount}</p>
        </div>
      </div>
    </div>
  );
}
