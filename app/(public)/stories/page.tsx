import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Visual Story Library — Explore All Stories",
  description: "Browse our complete collection of immersive full-screen Web Stories across travel, tech, food, lifestyle, and design.",
};

const PAGE_SIZE = 24;
export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function StoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const categorySlug = params.category;

  const whereClause: any = { status: StoryStatus.PUBLISHED };
  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  const [stories, total, categories] = await Promise.all([
    prisma.story.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({ where: whereClause }).catch(() => 0),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, color: true },
    }).catch(() => []),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Compass className="w-3.5 h-3.5" />
              Story Library
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Explore All Visual Stories
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Immerse yourself in interactive 9:16 visual narratives from our award-winning creators.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto hide-scrollbar pb-2">
            <Link
              href="/stories"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                !categorySlug
                  ? "bg-white text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              All Stories ({total})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/stories?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                  categorySlug === cat.slug
                    ? "bg-white text-slate-950 shadow-md"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {stories.map((story, i) => (
                <StoryCard key={story.id} story={story} priority={i < 6} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <ServerPagination
                  page={page}
                  totalPages={totalPages}
                  buildHref={(p) =>
                    categorySlug
                      ? `/stories?category=${categorySlug}&page=${p}`
                      : `/stories?page=${p}`
                  }
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
