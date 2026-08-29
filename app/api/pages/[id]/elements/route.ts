import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: pageId } = await params;
  const body = await req.json();

  const element = await prisma.storyElement.create({
    data: {
      pageId,
      type: body.type,
      content: body.content || {},
      position: body.position || { x: 0, y: 0 },
      size: body.size || { width: 80, height: 20 },
      style: body.style || {},
      animation: body.animation || {},
      link: body.link || null,
      altText: body.altText || null,
      order: body.order || 0,
    },
  });

  return NextResponse.json(element, { status: 201 });
}
