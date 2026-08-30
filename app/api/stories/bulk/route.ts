import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storyIds, action } = body;

    if (!Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json({ error: "No stories selected" }, { status: 400 });
    }

    if (action === "publish") {
      await prisma.story.updateMany({
        where: { id: { in: storyIds } },
        data: {
          status: StoryStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "BULK_PUBLISH_STORIES",
          entityType: "Story",
          entityId: storyIds.join(","),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `${storyIds.length} stories published successfully.`,
      });
    }

    if (action === "draft" || action === "unpublish") {
      await prisma.story.updateMany({
        where: { id: { in: storyIds } },
        data: {
          status: StoryStatus.DRAFT,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "BULK_DRAFT_STORIES",
          entityType: "Story",
          entityId: storyIds.join(","),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `${storyIds.length} stories moved to draft.`,
      });
    }

    if (action === "archive") {
      await prisma.story.updateMany({
        where: { id: { in: storyIds } },
        data: {
          status: StoryStatus.ARCHIVED,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "BULK_ARCHIVE_STORIES",
          entityType: "Story",
          entityId: storyIds.join(","),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `${storyIds.length} stories archived.`,
      });
    }

    if (action === "delete") {
      await prisma.story.deleteMany({
        where: { id: { in: storyIds } },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.userId,
          action: "BULK_DELETE_STORIES",
          entityType: "Story",
          entityId: storyIds.join(","),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `${storyIds.length} stories deleted permanently.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Bulk stories action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bulk action" },
      { status: 500 }
    );
  }
}
