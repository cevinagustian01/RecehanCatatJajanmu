import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/sync-user";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.id) return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });

    const synced = await syncUser(authUser.id, authUser.email || "");
    if (!synced) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: synced.id },
      data: { telegram_id: null, telegram_verified: false, connectTelegram: false }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Telegram Revoke Error]:", e);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
