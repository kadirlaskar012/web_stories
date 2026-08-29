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
          { title: { contains: query } },
          { description: { contains: query } },
          { excerpt: { contains: query } },
          { category: { name: { contains: query } } },
          { author: { name: { contains: query } } },
          { tags: { some: { tag: { name: { contains: query } } } } },
        ],
      },
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }).catch(() => []),
    prisma.story.count({
      where: {
        status: StoryStatus.PUBLISHED,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { excerpt: { contains: query } },
          { category: { name: { contains: query } } },
          { author: { name: { contains: query } } },
        ],
      },
    }).catch(() => 0),
  ]);

  if (stories.length === 0) {
    return <EmptySearchResults query={query} />;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-6">
        Found {total} visual stor{total === 1 ? "y" : "ies"} for &ldquo;{query}&rdquo;
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <StoryListCard key={story.id} story={story} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <ServerPagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => `/search?q=${encodeURIComponent(query)}&page=${p}`}
          />
        </div>
      )}
    </div>
  );
}
