import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryWizard } from "@/components/admin/StoryWizard";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: Props) {
  const { id } = await params;

  const [story, categories, authors] = await Promise.all([
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
    }).catch(() => null),
    prisma.category.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.author.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ]);

  if (!story) notFound();

  return (
    <div className="max-w-7xl mx-auto">
      <StoryWizard
        categories={categories}
        authors={authors}
        initialStory={story}
      />
    </div>
  );
}
