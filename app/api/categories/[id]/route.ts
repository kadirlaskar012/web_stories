import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { stories: true } },
    },
  });

  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_CATEGORY",
        entityType: "Category",
        entityId: id,
      },
    }).catch(() => {});

    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check if stories are assigned
  const storyCount = await prisma.story.count({ where: { categoryId: id } });
  if (storyCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete category with ${storyCount} assigned stories. Reassign them first.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_CATEGORY",
      entityType: "Category",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
