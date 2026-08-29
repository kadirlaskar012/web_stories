import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const author = await prisma.author.findUnique({
    where: { id },
    include: { _count: { select: { stories: true } } },
  });
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });
  return NextResponse.json(author);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.twitter !== undefined && { twitter: body.twitter }),
        ...(body.instagram !== undefined && { instagram: body.instagram }),
        ...(body.linkedin !== undefined && { linkedin: body.linkedin }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_AUTHOR",
        entityType: "Author",
        entityId: id,
      },
    }).catch(() => {});

    return NextResponse.json(author);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check if stories are assigned
  const storyCount = await prisma.story.count({ where: { authorId: id } });
  if (storyCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete author with ${storyCount} assigned stories. Reassign them first.` },
      { status: 400 }
    );
  }

  await prisma.author.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "DELETE_AUTHOR",
      entityType: "Author",
      entityId: id,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
