import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";

export async function POST(_req: NextRequest) {
  // Validate cron secret for production
  const authHeader = _req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all stories scheduled to be published now or in the past
  const scheduledStories = await prisma.story.findMany({
    where: {
      status: StoryStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
    select: { id: true, title: true, slug: true },
  });

  if (scheduledStories.length === 0) {
    return NextResponse.json({ published: 0, message: "No scheduled stories due" });
  }

  // Publish all
  const results = await Promise.allSettled(
    scheduledStories.map((story) =>
      prisma.story.update({
        where: { id: story.id },
        data: {
          status: StoryStatus.PUBLISHED,
          publishedAt: now,
          scheduledAt: null,
        },
      })
    )
  );

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  const failCount = results.filter((r) => r.status === "rejected").length;

  console.log(
    `[CRON] Published ${successCount} stories, ${failCount} failed at ${now.toISOString()}`
  );

  return NextResponse.json({
    published: successCount,
    failed: failCount,
    stories: scheduledStories.map((s) => s.slug),
    timestamp: now.toISOString(),
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
