import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import StoryEditorClient from "@/components/editor/StoryEditorClient";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params;

  const [story, categories, authors, tags] = await Promise.all([
    prisma.story.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { order: "asc" },
          include: { elements: { orderBy: { order: "asc" } } },
        },
        tags: { include: { tag: true } },
        author: true,
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!story) notFound();

  return (
    <StoryEditorClient
      story={story}
      categories={categories}
      authors={authors}
      allTags={tags}
    />
  );
}
