import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { generateUniqueSlug } from "@/lib/slugify";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  slug: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { name } = parsed.data;
    const slug = parsed.data.slug?.trim() || (await generateUniqueSlug(name, "tag"));

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    console.error("[TAGS_POST]", err);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
