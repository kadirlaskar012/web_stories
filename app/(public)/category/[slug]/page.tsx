import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { getSiteSettings } from "@/lib/settings";
import { generateCategoryMetadata } from "@/lib/seo/metadata";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { ChevronRight, ArrowLeft } from "lucide-react";

const PAGE_SIZE = 24;
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }).catch(() => null),
    getSiteSettings(),
  ]);
  if (!category) return { title: "Category Not Found" };
  return generateCategoryMetadata(category, settings);
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const category = await prisma.category.findUnique({ where: { slug } }).catch(() => null);
  if (!category) notFound();

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED, categoryId: category.id },
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({
      where: { status: StoryStatus.PUBLISHED, categoryId: category.id },
    }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Category Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-12 border-b border-slate-800">
        {/* Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: category.color || "#3b82f6" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link href="/stories" className="hover:text-white transition-colors">
              Topics
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-white font-medium">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: category.color || "#3b82f6" }}
            >
              {category.name[0]}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
                  {category.description}
                </p>
              )}
              <p className="text-xs font-semibold text-slate-400 mt-2">
                {total} {total === 1 ? "visual story" : "visual stories"} published
              </p>
            </div>
          </div>
        </div>
      </div>

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
                  buildHref={(p) => `/category/${slug}?page=${p}`}
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
