import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { Flame, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending Visual Stories — Most Popular Today",
  description: "The most popular Web Stories right now — trending across travel, technology, lifestyle, and food.",
};

export const revalidate = 60;
const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { viewCount: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({
      where: { status: StoryStatus.PUBLISHED },
    }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              Leaderboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Trending Visual Stories
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Ranked by reader engagement and visual impressions across the platform.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {stories.map((story, i) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  priority={i < 6}
                  rank={(page - 1) * PAGE_SIZE + i + 1}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <ServerPagination
                  page={page}
                  totalPages={totalPages}
                  buildHref={(p) => `/trending?page=${p}`}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyStories />
        )}
      </main>
    </div>
  );
}
