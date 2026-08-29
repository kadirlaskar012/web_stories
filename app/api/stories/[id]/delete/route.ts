import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Hard delete
  await prisma.story.delete({ where: { id } });

  await prisma.activityLog.create({
    data: { userId: session.userId, action: "DELETE_STORY", entityType: "Story", entityId: id },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
