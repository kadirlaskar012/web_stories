import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const element = await prisma.storyElement.update({
    where: { id },
    data: {
      content: body.content,
      position: body.position,
      size: body.size,
      style: body.style,
      animation: body.animation,
      link: body.link,
      altText: body.altText,
      order: body.order,
    },
  });

  return NextResponse.json(element);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.storyElement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
