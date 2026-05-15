import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { section, title, subtitle, content, isActive } = await request.json();

    if (!section) {
      return NextResponse.json({ error: "Section is required" }, { status: 400 });
    }

    const existing = await prisma.landingPageContent.findUnique({ where: { section } });
    if (existing) {
      return NextResponse.json({ error: "Section already exists" }, { status: 400 });
    }

    const maxOrder = await prisma.landingPageContent.aggregate({ _max: { order: true } });
    const newOrder = (maxOrder._max.order || 0) + 1;

    await prisma.landingPageContent.create({
      data: {
        section,
        title,
        subtitle,
        content: content || {},
        isActive: isActive !== false,
        order: newOrder,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, subtitle, content, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.landingPageContent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.landingPageContent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
