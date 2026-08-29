import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptyStories } from "@/components/ui/EmptyState";
import { getSiteSettings } from "@/lib/settings";
import { generateCategoryMetadata } from "@/lib/seo/metadata";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";

const PAGE_SIZE = 24;
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
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

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED, categoryId: category.id },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.story.count({
      where: { status: StoryStatus.PUBLISHED, categoryId: category.id },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><a href="/" className="hover:text-gray-900">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/stories" className="hover:text-gray-900">Stories</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: category.color || "#6366f1" }}
          aria-hidden="true"
        >
          {category.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500 mt-0.5 text-sm">{category.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{total} stories</p>
        </div>
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
              buildHref={(p) => `/category/${slug}?page=${p}`}
            />
          </div>
        </>
      ) : (
        <EmptyStories />
      )}
    </div>
  );
}
