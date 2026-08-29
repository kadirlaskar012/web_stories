import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// Unpublish
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updated = await prisma.story.update({
    where: { id },
    data: { status: StoryStatus.DRAFT },
  });

  await prisma.activityLog.create({
    data: { userId: session.userId, action: "UNPUBLISH_STORY", entityType: "Story", entityId: id },
  }).catch(() => {});

  return NextResponse.json(updated);
}
