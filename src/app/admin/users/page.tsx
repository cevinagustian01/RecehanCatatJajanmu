import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserActions } from "./UserActions";
import { AddUserModal } from "./AddUserModal";
import { format } from "date-fns";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <AddUserModal />
      </div>
      
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-slate-800">
              <TableHead className="text-slate-500 dark:text-slate-400">User</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Role</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Joined Date</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Monthly Budget</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No users found
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id} className="dark:border-slate-800 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                  <span className="block text-sm">{user.displayName || user.email || "Unknown"}</span>
                  {user.displayName && user.email && (
                    <span className="block text-xs text-slate-400 dark:text-slate-500">{user.email}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {format(new Date(user.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  Rp {user.monthly_budget.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <UserActions userId={user.id} currentRole={user.role} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
