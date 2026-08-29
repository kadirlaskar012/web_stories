import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { StoryStatus } from "@prisma/client";
import { formatDateShort } from "@/lib/utils";
import { Plus, Edit, Trash2, Eye, Copy } from "lucide-react";
import { ServerPagination } from "@/components/ui/Pagination";
import StoryActions from "./StoryActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function AdminStoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status as StoryStatus | undefined;
  const search = params.search || "";
  const categoryId = params.category || undefined;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(categoryId && { categoryId }),
  };

  const [stories, total, categories] = await Promise.all([
    prisma.story.findMany({
      where,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.story.count({ where }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { order: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statuses: { value: string; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: StoryStatus.DRAFT, label: "Draft" },
    { value: StoryStatus.REVIEW, label: "In Review" },
    { value: StoryStatus.SCHEDULED, label: "Scheduled" },
    { value: StoryStatus.PUBLISHED, label: "Published" },
    { value: StoryStatus.ARCHIVED, label: "Archived" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total stories</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Story
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search stories..."
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          aria-label="Search stories"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          aria-label="Filter by status"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={categoryId || ""}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          Filter
        </button>
        {(search || status || categoryId) && (
          <a
            href="/admin/stories"
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Updated
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                          {story.title}
                        </p>
                        {story.isFeatured && (
                          <span className="text-xs text-blue-600 font-medium">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {story.author.name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: story.category.color || "#6366f1" }}
                      >
                        {story.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={story.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                      {formatDateShort(story.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/stories/${story.id}/edit`}
                          className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          aria-label={`Edit ${story.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {story.status === StoryStatus.PUBLISHED && (
                          <a
                            href={`/story/${story.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            aria-label={`View ${story.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <StoryActions story={{ id: story.id, title: story.title, status: story.status }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No stories found.{" "}
                    <Link href="/admin/stories/new" className="text-blue-600 hover:underline">
                      Create your first story
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-100 flex justify-center">
            <ServerPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const sp = new URLSearchParams();
                if (search) sp.set("search", search);
                if (status) sp.set("status", status);
                if (categoryId) sp.set("category", categoryId);
                sp.set("page", String(p));
                return `/admin/stories?${sp}`;
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
