import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { generateUniqueSlug } from "@/lib/slugify";
import { z } from "zod";

const authorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });
  return NextResponse.json(authors);
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = authorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { name, bio, avatar, website, twitter, instagram, linkedin } = parsed.data;
    const slug = parsed.data.slug?.trim() || (await generateUniqueSlug(name, "author"));

    const author = await prisma.author.create({
      data: {
        name,
        slug,
        bio: bio || null,
        avatar: avatar || null,
        website: website || null,
        twitter: twitter || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_AUTHOR",
        entityType: "Author",
        entityId: author.id,
      },
    }).catch(() => {});

    return NextResponse.json(author, { status: 201 });
  } catch (err) {
    console.error("[AUTHORS_POST]", err);
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
