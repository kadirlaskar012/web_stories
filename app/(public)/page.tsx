import Link from "next/link";
import Image from "next/image";
import { StoryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { getSiteSettings } from "@/lib/settings";
import {
  Flame,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  Play,
  Eye,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredStories, trendingStories, latestStories, categories, authors, settings] =
    await Promise.all([
      // Featured stories
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED, isFeatured: true },
        include: {
          author: { select: { name: true, slug: true, avatar: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }).catch(() => []),

      // Trending stories (by views)
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED },
        include: {
          author: { select: { name: true, slug: true, avatar: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { viewCount: "desc" },
        take: 6,
      }).catch(() => []),

      // Latest stories
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED },
        include: {
          author: { select: { name: true, slug: true, avatar: true } },
          category: { select: { name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 8,
      }).catch(() => []),

      // Categories with story counts
      prisma.category.findMany({
        orderBy: { order: "asc" },
        take: 6,
        include: {
          _count: {
            select: { stories: true },
          },
        },
      }).catch(() => []),

      // Authors with story counts
      prisma.author.findMany({
        take: 4,
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { stories: true },
          },
        },
      }).catch(() => []),

      getSiteSettings(),
    ]);

  const heroStory = featuredStories[0] || latestStories[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      {heroStory && (
        <section className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-16 lg:py-20">
          {/* Ambient Lighting & Glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Story of the Day
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: heroStory.category.color || "#3b82f6" }}
                  >
                    {heroStory.category.name}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                  {heroStory.title}
                </h1>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed line-clamp-3 max-w-2xl">
                  {heroStory.description || heroStory.excerpt}
                </p>

                {/* Author & Metrics */}
                <div className="flex items-center gap-4 py-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 relative flex-shrink-0">
                      {heroStory.author.avatar ? (
                        <Image
                          src={heroStory.author.avatar}
                          alt={heroStory.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center font-bold text-xs">
                          {heroStory.author.name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white leading-none">{heroStory.author.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Verified Creator</p>
                    </div>
                  </div>

                  {heroStory.viewCount > 0 && (
                    <>
                      <span className="text-slate-600">|</span>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span>{heroStory.viewCount.toLocaleString()} visual reads</span>
                      </div>
                    </>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={`/story/${heroStory.slug}`}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Full Story</span>
                  </Link>
                  <Link
                    href="/stories"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/10 transition-colors"
                  >
                    <span>Browse All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 9:16 Interactive Canvas Preview */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <Link
                  href={`/story/${heroStory.slug}`}
                  className="group relative block w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/15 transform hover:-translate-y-2 transition-all duration-300"
                  aria-label={`Open story: ${heroStory.title}`}
                >
                  {/* Ambient Backlight */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-60 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${heroStory.coverImage})` }}
                  />

                  {/* High-Res Story Slide Cover */}
                  {heroStory.coverImage && (
                    <Image
                      src={heroStory.coverImage}
                      alt={heroStory.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                      quality={90}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Pulsing Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-600 transition-all shadow-xl">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>

                  {/* Story Card Details */}
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider text-white px-2.5 py-1 rounded-full w-fit inline-block"
                      style={{ backgroundColor: heroStory.category.color || "#3b82f6" }}
                    >
                      {heroStory.category.name}
                    </span>
                    <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                      {heroStory.title}
                    </h3>
                    <p className="text-white/70 text-xs flex items-center gap-2">
                      <span>By {heroStory.author.name}</span>
                      <span>·</span>
                      <span>Tap to play</span>
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Trending Stories (Snap Rail) ─────────────────────────────────── */}
      {trendingStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Trending Now
                </h2>
                <p className="text-xs text-slate-500 font-medium">Most viewed visual narratives this week</p>
              </div>
            </div>
            <Link
              href="/trending"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Scroll Rail */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {trendingStories.map((story, index) => (
              <StoryCard key={story.id} story={story} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Topic Explorer (Category Hub) ────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Explore Topics
                </h2>
                <p className="text-xs text-slate-500 font-medium">Curated collections tailored to your interests</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                >
                  {cat.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cat._count?.stories || 0} {cat._count?.stories === 1 ? "story" : "stories"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Latest Stories Grid ─────────────────────────────────────────── */}
      {latestStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Latest Visual Stories
                </h2>
                <p className="text-xs text-slate-500 font-medium">Fresh visual narratives published daily</p>
              </div>
            </div>
            <Link
              href="/stories"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all"
            >
              View Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {latestStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Creator Spotlight (Only if multiple authors or customized) ───── */}
      {authors.length > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Featured Storytellers
                </h2>
                <p className="text-xs text-slate-500 font-medium">Award-winning creators sharing their perspectives</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/author/${author.slug}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-slate-100 group-hover:border-blue-500 transition-colors">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg">
                      {author.name[0]}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {author.name}
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {author.bio || "Visual Storyteller"}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">
                    {author._count?.stories || 0} stories published
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
