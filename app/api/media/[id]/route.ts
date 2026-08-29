import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });
  return NextResponse.json(media);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const media = await prisma.media.update({
      where: { id },
      data: {
        ...(body.altText !== undefined && { altText: body.altText }),
        ...(body.filename && { filename: body.filename }),
      },
    });
    return NextResponse.json(media);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.media.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_MEDIA",
      entityType: "Media",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
