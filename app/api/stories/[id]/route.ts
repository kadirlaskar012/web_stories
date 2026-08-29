import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";
import { validateStoryForPublishing, hasBlockingErrors } from "@/lib/stories/validation";
import { absoluteUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      pages: {
        orderBy: { order: "asc" },
        include: { elements: { orderBy: { order: "asc" } } },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(story);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Save revision before updating
  await prisma.revision.create({
    data: {
      storyId: id,
      data: story as object,
      editedById: session.userId,
    },
  }).catch(() => {});

  const { tagIds, scheduledAt, ...updateData } = body;

  const updated = await prisma.story.update({
    where: { id },
    data: {
      ...updateData,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      updatedAt: new Date(),
      ...(tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({ tag: { connect: { id: tagId } } })),
        },
      }),
    },
    include: {
      author: true,
      category: true,
      pages: {
        orderBy: { order: "asc" },
        include: { elements: { orderBy: { order: "asc" } } },
      },
      tags: { include: { tag: true } },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "UPDATE_STORY",
      entityType: "Story",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.story.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_STORY",
      entityType: "Story",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
