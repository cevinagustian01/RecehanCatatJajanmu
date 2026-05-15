import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { key, value, type } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ error: "Setting already exists" }, { status: 400 });
    }

    await prisma.siteSetting.create({
      data: { key, value: String(value), type: type || "string" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, value, type } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.siteSetting.update({
      where: { id },
      data: {
        ...(value !== undefined && { value: String(value) }),
        ...(type && { type }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.siteSetting.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
