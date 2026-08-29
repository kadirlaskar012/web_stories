import { prisma } from "@/lib/db";
import { StoryListCard } from "@/components/story/StoryCard";
import { ServerPagination } from "@/components/ui/Pagination";
import { EmptySearchResults, EmptyState } from "@/components/ui/EmptyState";
import { StoryStatus } from "@prisma/client";
import { Search } from "lucide-react";

const PAGE_SIZE = 12;

interface Props {
  query: string;
  page: number;
}

export default async function SearchResults({ query, page }: Props) {
  if (!query) {
    return (
      <EmptyState
        icon={<Search className="w-7 h-7" />}
        title="Enter a search term"
        description="Search by story title, description, category name, or author name."
      />
    );
  }

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where: {
        status: StoryStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
          { author: { name: { contains: query, mode: "insensitive" } } },
          { tags: { some: { tag: { name: { contains: query, mode: "insensitive" } } } } },
        ],
      },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.story.count({
      where: {
        status: StoryStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
          { author: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
    }),
  ]);

  if (stories.length === 0) {
    return <EmptySearchResults query={query} />;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>

      <div className="space-y-6 divide-y divide-gray-100">
        {stories.map((story) => (
          <div key={story.id} className="pt-6 first:pt-0">
            <StoryListCard story={story} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <ServerPagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
        />
      </div>
    </div>
  );
}
