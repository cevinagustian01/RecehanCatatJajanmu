"use client";

import { useState } from "react";
import { deleteUser, updateUserRole } from "../actions";
import { toast } from "sonner";
import { Loader2, Trash2, Edit2 } from "lucide-react";

export function UserActions({ userId, currentRole }: { userId: string, currentRole: "USER" | "ADMIN" }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    setLoading(true);
    const res = await deleteUser(userId);
    if (res.success) {
      toast.success("User deleted successfully!");
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const handleToggleRole = async () => {
    setLoading(true);
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      toast.success(`User role updated to ${newRole}`);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggleRole}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
        title="Toggle Role"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
      </button>
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        title="Delete User"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
