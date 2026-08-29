import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";
import { validateStoryForPublishing, hasBlockingErrors } from "@/lib/stories/validation";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      pages: { include: { elements: true } },
    },
  });

  if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

  // Validate before publishing
  const errors = validateStoryForPublishing(story);
  if (hasBlockingErrors(errors)) {
    return NextResponse.json(
      { error: "Story has validation errors", errors },
      { status: 422 }
    );
  }

  const updated = await prisma.story.update({
    where: { id },
    data: {
      status: StoryStatus.PUBLISHED,
      publishedAt: story.publishedAt || new Date(),
      scheduledAt: null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "PUBLISH_STORY",
      entityType: "Story",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json(updated);
}
