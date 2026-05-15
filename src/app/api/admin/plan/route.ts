import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PLAN_CREDITS: Record<string, number> = {
  FREE: 10,
  PRO: 100,
  ULTRA: 999999,
};

export async function POST(request: Request) {
  try {
    const { userId, plan } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!PLAN_CREDITS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        maxCredits: PLAN_CREDITS[plan],
        credits: plan === "ULTRA" ? 999999 : Math.min(user.credits, PLAN_CREDITS[plan]),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
