import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { getSiteSettings } from "@/lib/settings";
import { generateWebSiteJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { StoryStatus } from "@prisma/client";

const STORIES_PER_SECTION = 6;

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const settings = await getSiteSettings();

  const [featuredStory, latestStories, trendingStories, categories] =
    await Promise.all([
      // Featured story
      prisma.story.findFirst({
        where: { status: StoryStatus.PUBLISHED, isFeatured: true },
        include: {
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
      }).catch(() => null),
      // Latest stories
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED },
        include: {
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: STORIES_PER_SECTION,
      }).catch(() => []),
      // Trending stories (by view count)
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED },
        include: {
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { viewCount: "desc" },
        take: 5,
      }).catch(() => []),
      // Categories with counts
      prisma.category.findMany({
        orderBy: { order: "asc" },
        take: 8,
        include: {
          _count: {
            select: { stories: { where: { status: StoryStatus.PUBLISHED } } },
          },
        },
      }).catch(() => []),
    ]);

  const websiteJsonLd = generateWebSiteJsonLd(settings);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      {featuredStory ? (
        <section
          className="relative overflow-hidden bg-gray-900"
          aria-labelledby="hero-title"
        >
          {featuredStory.coverImage && (
            <Image
              src={featuredStory.coverImage}
              alt={featuredStory.title}
              fill
              className="object-cover opacity-40"
              priority
              quality={90}
              sizes="100vw"
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
            <div className="max-w-2xl">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                style={{
                  backgroundColor:
                    featuredStory.category.color || "#6366f1",
                }}
              >
                {featuredStory.category.name}
              </span>
              <h1
                id="hero-title"
                className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4"
              >
                {featuredStory.title}
              </h1>
              {featuredStory.description && (
                <p className="text-lg text-white/80 mb-6 leading-relaxed line-clamp-2">
                  {featuredStory.description}
                </p>
              )}
              <div className="flex items-center gap-4 mb-8 text-white/60 text-sm">
                <span>By {featuredStory.author.name}</span>
                {featuredStory.publishedAt && (
                  <time dateTime={featuredStory.publishedAt.toISOString()}>
                    {formatDate(featuredStory.publishedAt)}
                  </time>
                )}
              </div>
              <Link
                href={`/story/${featuredStory.slug}`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                Read Story
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {settings.site_name}
            </h1>
            <p className="text-xl text-white/70 mb-8">
              {settings.site_description}
            </p>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold"
            >
              Browse Stories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ─── LATEST STORIES ───────────────────────────────────────────── */}
      {latestStories.length > 0 && (
        <section className="py-12 sm:py-16" aria-labelledby="latest-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" aria-hidden="true" />
                <h2
                  id="latest-heading"
                  className="text-xl font-bold text-gray-900"
                >
                  Latest Stories
                </h2>
              </div>
              <Link
                href="/latest"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
              {latestStories.map((story, i) => (
                <div
                  key={story.id}
                  className="flex-shrink-0 w-44 sm:w-auto snap-start"
                >
                  <StoryCard story={story} priority={i < 3} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRENDING ─────────────────────────────────────────────────── */}
      {trendingStories.length > 0 && (
        <section
          className="py-10 bg-gray-50"
          aria-labelledby="trending-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp
                className="w-5 h-5 text-orange-500"
                aria-hidden="true"
              />
              <h2
                id="trending-heading"
                className="text-xl font-bold text-gray-900"
              >
                Trending Now
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {trendingStories.map((story, i) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="flex items-center gap-4 group"
                  aria-label={`Trending #${i + 1}: ${story.title}`}
                >
                  <span className="text-3xl font-black text-gray-200 leading-none w-10 text-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    {story.coverImage && (
                      <Image
                        src={story.coverImage}
                        alt={story.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: story.category.color || "#6366f1" }}
                    >
                      {story.category.name}
                    </span>
                    <h3 className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {story.viewCount.toLocaleString()} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16" aria-labelledby="categories-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2
              id="categories-heading"
              className="text-xl font-bold text-gray-900 mb-6"
            >
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: cat.color || "#6366f1" }}
                    aria-hidden="true"
                  >
                    {cat.name[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {cat._count.stories} stories
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
