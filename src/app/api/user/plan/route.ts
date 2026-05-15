import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      select: {
        subscriptionPlan: true,
        credits: true,
        maxCredits: true,
      },
    });

    if (!user) {
      return NextResponse.json({ plan: "FREE", credits: 10, maxCredits: 10 });
    }

    return NextResponse.json({
      plan: user.subscriptionPlan,
      credits: user.credits,
      maxCredits: user.maxCredits,
    });
  } catch (error) {
    console.error("User plan fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
