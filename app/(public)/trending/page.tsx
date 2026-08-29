import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending Stories",
  description: "The most popular Web Stories right now — trending across all categories.",
};

export const revalidate = 300;

const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED, viewCount: { gt: 0 } },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { viewCount: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({
      where: { status: StoryStatus.PUBLISHED, viewCount: { gt: 0 } },
    }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 mb-8">
        <TrendingUp className="w-6 h-6 text-orange-500" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Trending Stories</h1>
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
              buildHref={(p) => `/trending?page=${p}`}
            />
          </div>
        </>
      ) : (
        <EmptyStories />
      )}
    </div>
  );
}
