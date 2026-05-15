import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { userId, action, amount } = await request.json();

    if (!userId || !action || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newCredits = user.credits;
    if (action === "add") {
      newCredits = user.credits + amount;
    } else if (action === "remove") {
      newCredits = Math.max(0, user.credits - amount);
    } else if (action === "set") {
      newCredits = amount;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits: newCredits },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, credits: newCredits });
  } catch (error) {
    console.error("Credit update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
