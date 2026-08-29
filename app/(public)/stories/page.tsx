import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Stories",
  description: "Discover all published Web Stories — news, travel, food, technology, lifestyle, and more.",
};

const PAGE_SIZE = 24;

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function StoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({ where: { status: StoryStatus.PUBLISHED } }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Stories</h1>
        <p className="text-gray-500 mt-1">{total} stories published</p>
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
              buildHref={(p) => `/stories?page=${p}`}
            />
          </div>
        </>
      ) : (
        <EmptyStories />
      )}
    </div>
  );
}
