import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { generateUniqueSlug } from "@/lib/slugify";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color hex").optional().nullable(),
  order: z.number().int().optional().default(0),
});

export async function GET(req: NextRequest) {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { stories: true },
      },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { name, description, color, order } = parsed.data;
    const slug = parsed.data.slug?.trim() || (await generateUniqueSlug(name, "category"));

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || "#6366f1",
        order: order ?? 0,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_CATEGORY",
        entityType: "Category",
        entityId: category.id,
      },
    }).catch(() => {});

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("[CATEGORIES_POST]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
