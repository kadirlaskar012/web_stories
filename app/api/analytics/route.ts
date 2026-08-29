import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Story views by category
  const categories = await prisma.category.findMany({
    include: {
      stories: {
        where: { status: StoryStatus.PUBLISHED },
        select: { viewCount: true },
      },
    },
  });

  const categoryStats = categories.map((c) => ({
    name: c.name,
    color: c.color,
    storyCount: c.stories.length,
    totalViews: c.stories.reduce((sum, s) => sum + s.viewCount, 0),
  }));

  // Top stories
  const topStories = await prisma.story.findMany({
    where: { status: StoryStatus.PUBLISHED },
    orderBy: { viewCount: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      publishedAt: true,
      author: { select: { name: true } },
      category: { select: { name: true, color: true } },
    },
  });

  // Overall counts
  const totalPublished = await prisma.story.count({ where: { status: StoryStatus.PUBLISHED } });
  const totalViewsAggregate = await prisma.story.aggregate({ _sum: { viewCount: true } });
  const totalViews = totalViewsAggregate._sum.viewCount || 0;

  return NextResponse.json({
    totalViews,
    totalPublished,
    categoryStats,
    topStories,
  });
}
