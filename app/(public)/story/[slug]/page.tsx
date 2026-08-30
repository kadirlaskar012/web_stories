import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { StoryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import StoryViewerWrapper from "./StoryViewerWrapper";
import { generateStoryMetadata } from "@/lib/seo/metadata";
import {
  generateStoryJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import { getSiteSettings } from "@/lib/settings";
import { absoluteUrl, formatDate } from "@/lib/utils";
import {
  Share2,
  Eye,
  Calendar,
  Sparkles,
  Zap,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const stories = await prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      select: { slug: true },
      take: 50,
    });
    return stories.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const [story, settings] = await Promise.all([
      prisma.story.findUnique({
        where: { slug, status: StoryStatus.PUBLISHED },
        include: { author: true, category: true, tags: { include: { tag: true } } },
      }).catch(() => null),
      getSiteSettings(),
    ]);

    if (!story) return { title: "Web Story" };
    return generateStoryMetadata(story, settings);
  } catch {
    return { title: "Web Story" };
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;

  const [story, settings] = await Promise.all([
    prisma.story.findUnique({
      where: { slug, status: StoryStatus.PUBLISHED },
      include: {
        author: true,
        category: true,
        pages: {
          orderBy: { order: "asc" },
          include: { elements: { orderBy: { order: "asc" } } },
        },
        tags: { include: { tag: true } },
      },
    }).catch(() => null),
    getSiteSettings(),
  ]);

  if (!story) notFound();

  // Find next published story in queue
  const nextStory = await prisma.story
    .findFirst({
      where: {
        status: StoryStatus.PUBLISHED,
        id: { not: story.id },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        category: { select: { name: true } },
      },
    })
    .catch(() => null);

  const formattedNextStory = nextStory
    ? {
        id: nextStory.id,
        slug: nextStory.slug,
        title: nextStory.title,
        coverImage: nextStory.coverImage,
        categoryName: nextStory.category.name,
      }
    : null;

  // Related stories in same category
  const relatedStories = await prisma.story
    .findMany({
      where: {
        status: StoryStatus.PUBLISHED,
        categoryId: story.categoryId,
        id: { not: story.id },
      },
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 4,
    })
    .catch(() => []);

  const articleJsonLd = generateStoryJsonLd(story, settings);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    {
      name: story.category.name,
      url: absoluteUrl(`/category/${story.category.slug}`),
    },
    { name: story.title, url: absoluteUrl(`/story/${story.slug}`) },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Top Header / Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 truncate max-w-[70%]">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link
              href={`/category/${story.category.slug}`}
              className="hover:text-white transition-colors"
            >
              {story.category.name}
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
            <span className="text-slate-300 font-medium truncate hidden sm:inline">{story.title}</span>
          </nav>

          <Link
            href={`/story/${story.slug}/amp`}
            target="_blank"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-bold hover:bg-amber-400/20 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>Google AMP Story</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Story Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Centered / Left: 9:16 Interactive Web Story Player */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] sm:max-w-[380px] h-[640px] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative bg-black">
              <StoryViewerWrapper
                pages={story.pages}
                storyId={story.id}
                title={story.title}
                authorName={story.author.name}
                publisherName={settings.publisher_name}
                categorySlug={story.category.slug}
                nextStory={formattedNextStory}
              />
            </div>
          </div>

          {/* Right Column: Editorial Byline & Metadata */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 pt-2">
            <div className="space-y-3">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: story.category.color || "#3b82f6" }}
              >
                {story.category.name}
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {story.title}
              </h1>

              {story.description && (
                <p className="text-slate-300 text-base leading-relaxed">
                  {story.description}
                </p>
              )}
            </div>

            {/* Author Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <Link
                href={`/author/${story.author.slug}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600 group-hover:border-blue-500 transition-colors">
                  {story.author.avatar ? (
                    <Image
                      src={story.author.avatar}
                      alt={story.author.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">
                      {story.author.name[0]}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {story.author.name}
                  </h3>
                  <p className="text-xs text-slate-400">Visual Contributor</p>
                </div>
              </Link>

              <div className="text-right text-xs text-slate-400 space-y-1">
                {story.publishedAt && (
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{formatDate(story.publishedAt)}</span>
                  </div>
                )}
                {story.viewCount > 0 && (
                  <div className="flex items-center justify-end gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>{story.viewCount.toLocaleString()} visual reads</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Strip */}
            {story.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Topics in this Story
                </p>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Player Instructions */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Google Web Stories Interaction Guide
              </p>
              <ul className="text-slate-300 space-y-1 pl-4 list-disc leading-relaxed">
                <li>Tap <strong>Right</strong> side: Advance to next slide.</li>
                <li>Tap <strong>Left</strong> side: Return to previous slide.</li>
                <li><strong>Press & Hold</strong>: Pause slide timer and media.</li>
                <li><strong>Swipe Left / Right</strong>: Smooth gesture page flip.</li>
                <li><strong>Swipe Down</strong> / <kbd className="bg-slate-800 px-1 rounded text-white">Esc</kbd>: Close player.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Stories Section */}
        {relatedStories.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
              More in {story.category.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedStories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
