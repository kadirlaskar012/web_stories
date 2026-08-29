import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { StoryStatus } from "@prisma/client";
import { generateUniqueSlug } from "@/lib/slugify";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const storySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  authorId: z.string().min(1, "Author is required"),
  status: z.nativeEnum(StoryStatus).optional().default(StoryStatus.DRAFT),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  socialImage: z.string().optional(),
  robotsMeta: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  scheduledAt: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status") as StoryStatus | null;
  const search = searchParams.get("search") || "";
  const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
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
    }),
    prisma.story.count({ where }),
  ]);

  return NextResponse.json({ stories, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = storySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { tagIds, scheduledAt, ...data } = parsed.data;

    const slug = await generateUniqueSlug(data.title, "story");
    const canonicalUrl = absoluteUrl(`/story/${slug}`);

    const story = await prisma.story.create({
      data: {
        ...data,
        slug,
        canonicalUrl,
        userId: session.userId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
            }
          : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_STORY",
        entityType: "Story",
        entityId: story.id,
      },
    }).catch(() => {});

    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    console.error("[STORIES_POST]", err);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
