import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";

const PAGE_SIZE = 24;
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const tag = await prisma.tag.findUnique({ where: { slug } }).catch(() => null);
    if (!tag) return { title: "Tag" };
    return {
      title: `#${tag.name} Stories`,
      description: `Browse all Web Stories tagged with #${tag.name}`,
    };
  } catch {
    return { title: "Tag" };
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const tag = await prisma.tag.findUnique({ where: { slug } }).catch(() => null);
  if (!tag) notFound();

  const [storyTags, total] = await Promise.all([
    prisma.storyTag.findMany({
      where: {
        tagId: tag.id,
        story: { status: StoryStatus.PUBLISHED },
      },
      include: {
        story: {
          include: {
            author: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true, color: true } },
          },
        },
      },
      orderBy: { story: { publishedAt: "desc" } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.storyTag.count({
      where: {
        tagId: tag.id,
        story: { status: StoryStatus.PUBLISHED },
      },
    }).catch(() => 0),
  ]);

  const stories = storyTags.map((st) => st.story);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><a href="/" className="hover:text-gray-900">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/stories" className="hover:text-gray-900">Stories</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium">#{tag.name}</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">#{tag.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{total} stories tagged with #{tag.name}</p>
      </div>

      {stories.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stories.map((story, i) => (
              <StoryCard key={story.id} story={story} priority={i < 6} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => `/tag/${slug}?page=${p}`}
            />
          </div>
        </>
      ) : (
        <EmptyStories />
      )}
    </div>
  );
}
