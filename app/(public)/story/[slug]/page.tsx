import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryCard } from "@/components/story/StoryCard";
import { getSiteSettings } from "@/lib/settings";
import { generateStoryMetadata } from "@/lib/seo/metadata";
import { generateStoryJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import StoryViewerWrapper from "./StoryViewerWrapper";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [story, settings] = await Promise.all([
    prisma.story.findUnique({
      where: { slug, status: StoryStatus.PUBLISHED },
      include: { author: true, category: true },
    }),
    getSiteSettings(),
  ]);
  if (!story) return { title: "Story Not Found" };
  return generateStoryMetadata(story, settings);
}

export async function generateStaticParams() {
  try {
    const stories = await prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      select: { slug: true },
    });
    return stories.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
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
    }),
    getSiteSettings(),
  ]);

  if (!story) notFound();

  // Increment view count (fire-and-forget)
  prisma.story.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Related stories
  const relatedStories = await prisma.story.findMany({
    where: {
      status: StoryStatus.PUBLISHED,
      categoryId: story.categoryId,
      id: { not: story.id },
    },
    include: {
      author: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, color: true } },
    },
    orderBy: { viewCount: "desc" },
    take: 6,
  });

  const articleJsonLd = generateStoryJsonLd(story, settings);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: story.category.name, url: absoluteUrl(`/category/${story.category.slug}`) },
    { name: story.title, url: absoluteUrl(`/story/${story.slug}`) },
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/category/${story.category.slug}`}
                className="hover:text-gray-900"
              >
                {story.category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium line-clamp-1">{story.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          {/* Main content */}
          <div>
            {/* Header */}
            <header className="mb-6">
              <Link
                href={`/category/${story.category.slug}`}
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                style={{ backgroundColor: story.category.color || "#6366f1" }}
              >
                {story.category.name}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                {story.title}
              </h1>
              {story.description && (
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  {story.description}
                </p>
              )}
              <div className="flex items-center gap-4">
                <Link
                  href={`/author/${story.author.slug}`}
                  className="flex items-center gap-2 group"
                  aria-label={`Author: ${story.author.name}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {story.author.avatar ? (
                      <Image
                        src={story.author.avatar}
                        alt={story.author.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs font-bold">
                        {story.author.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {story.author.name}
                    </p>
                    {story.publishedAt && (
                      <time
                        dateTime={story.publishedAt.toISOString()}
                        className="text-xs text-gray-400"
                      >
                        {formatDate(story.publishedAt)}
                      </time>
                    )}
                  </div>
                </Link>
              </div>
            </header>

            {/* Story Viewer */}
            <StoryViewerWrapper
              pages={story.pages}
              title={story.title}
              authorName={story.author.name}
              publisherName={settings.publisher_name}
            />

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {story.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Related Stories */}
          {relatedStories.length > 0 && (
            <aside>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                More from {story.category.name}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {relatedStories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}
