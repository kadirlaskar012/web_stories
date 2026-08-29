import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";
import { generateUniqueSlug } from "@/lib/slugify";
import { absoluteUrl } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status") as StoryStatus | null;
  const search = searchParams.get("search") || "";
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

  const where: any = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where,
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }).catch(() => []),
    prisma.story.count({ where }).catch(() => 0),
  ]);

  return NextResponse.json({ stories, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    let userId = session?.userId;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id;
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      description,
      excerpt,
      coverImage,
      categoryId,
      authorId,
      status = StoryStatus.DRAFT,
      isFeatured = false,
      scheduledAt,
      tags = [],
      pages = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!authorId) {
      return NextResponse.json({ error: "Author is required" }, { status: 400 });
    }

    const slug = customSlug
      ? await generateUniqueSlug(customSlug, "story")
      : await generateUniqueSlug(title, "story");
    const canonicalUrl = absoluteUrl(`/story/${slug}`);

    const story = await prisma.story.create({
      data: {
        title,
        slug,
        description,
        excerpt: excerpt || description?.slice(0, 120),
        coverImage,
        categoryId,
        authorId,
        isFeatured,
        status,
        canonicalUrl,
        userId: userId || null,
        publishedAt: status === StoryStatus.PUBLISHED ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // Handle Tags
    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;
        const tagSlug = cleanName.toLowerCase().replace(/\s+/g, "-");
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: cleanName, slug: tagSlug },
        });

        await prisma.storyTag.create({
          data: {
            storyId: story.id,
            tagId: tag.id,
          },
        }).catch(() => {});
      }
    }

    // Handle Pages & Elements
    if (Array.isArray(pages) && pages.length > 0) {
      for (const p of pages) {
        const page = await prisma.storyPage.create({
          data: {
            storyId: story.id,
            order: p.order ?? 0,
            background: p.background || "#0f172a",
            duration: p.duration || 7,
          },
        });

        if (Array.isArray(p.elements) && p.elements.length > 0) {
          for (const el of p.elements) {
            await prisma.storyElement.create({
              data: {
                pageId: page.id,
                type: el.type,
                content: el.content || {},
                position: el.position || { x: 0, y: 0 },
                size: el.size || { width: 100, height: 100 },
                style: el.style || {},
                order: el.order ?? 0,
              },
            });
          }
        }
      }
    }

    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "CREATE_STORY",
          entityType: "Story",
          entityId: story.id,
        },
      }).catch(() => {});
    }

    return NextResponse.json(story, { status: 201 });
  } catch (err: any) {
    console.error("[STORIES_POST]", err);
    return NextResponse.json({ error: err.message || "Failed to create story" }, { status: 500 });
  }
}
