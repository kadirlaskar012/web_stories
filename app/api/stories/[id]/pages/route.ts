import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: storyId } = await params;
  const body = await req.json();

  const page = await prisma.storyPage.create({
    data: {
      storyId,
      order: body.order ?? 0,
      background: body.background || "#000000",
      duration: body.duration || 7,
    },
  });

  return NextResponse.json(page, { status: 201 });
}
