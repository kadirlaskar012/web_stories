import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EventType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyId, eventType, pageIndex, sessionId, metadata } = body;

    if (!storyId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let prismaEventType: EventType;
    switch (eventType) {
      case "VIEW":
      case "story_open":
        prismaEventType = EventType.VIEW;
        break;
      case "COMPLETION":
      case "story_complete":
        prismaEventType = EventType.COMPLETION;
        break;
      case "PAGE_VIEW":
      case "page_view":
        prismaEventType = EventType.PAGE_VIEW;
        break;
      case "CTA_CLICK":
      case "cta_click":
        prismaEventType = EventType.CTA_CLICK;
        break;
      case "SHARE_CLICK":
      case "share_click":
        prismaEventType = EventType.SHARE_CLICK;
        break;
      default:
        prismaEventType = EventType.VIEW;
    }

    // Record event
    await prisma.analyticsEvent.create({
      data: {
        storyId,
        eventType: prismaEventType,
        pageIndex: typeof pageIndex === "number" ? pageIndex : null,
        sessionId: sessionId || null,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    // If story open, also increment story viewCount
    if (prismaEventType === EventType.VIEW) {
      await prisma.story.update({
        where: { id: storyId },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record event" }, { status: 500 });
  }
}
