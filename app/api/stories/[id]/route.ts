import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";
import { generateUniqueSlug } from "@/lib/slugify";
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

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug: customSlug,
      description,
      excerpt,
      coverImage,
      categoryId,
      authorId,
      status,
      isFeatured,
      scheduledAt,
      tags = [],
      pages = [],
    } = body;

    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const slug = customSlug || existing.slug;
    const canonicalUrl = absoluteUrl(`/story/${slug}`);

    // Update Story record
    const updated = await prisma.story.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        excerpt: excerpt || description?.slice(0, 120),
        coverImage,
        categoryId,
        authorId,
        isFeatured: isFeatured ?? existing.isFeatured,
        status: status || existing.status,
        canonicalUrl,
        publishedAt:
          status === StoryStatus.PUBLISHED && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        updatedAt: new Date(),
      },
    });

    // Handle Tags update
    if (Array.isArray(tags)) {
      await prisma.storyTag.deleteMany({ where: { storyId: id } });
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
          data: { storyId: id, tagId: tag.id },
        }).catch(() => {});
      }
    }

    // Handle Pages & Elements update
    if (Array.isArray(pages) && pages.length > 0) {
      await prisma.storyPage.deleteMany({ where: { storyId: id } });

      for (const p of pages) {
        const page = await prisma.storyPage.create({
          data: {
            storyId: id,
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

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_STORY",
        entityType: "Story",
        entityId: id,
      },
    }).catch(() => {});

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[STORIES_PUT]", err);
    return NextResponse.json({ error: err.message || "Failed to update story" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
  });

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
