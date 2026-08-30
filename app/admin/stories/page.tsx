import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { StoryStatus } from "@prisma/client";
import { formatDateShort } from "@/lib/utils";
import { Plus, Edit, Eye, Filter, Sparkles, Layers } from "lucide-react";
import { ServerPagination } from "@/components/ui/Pagination";
import { StoriesTableClient } from "@/components/admin/StoriesTableClient";

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-600" />
            <span>Web Stories Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{total} total stories published & drafted</p>
        </div>

        <Link
          href="/admin/stories/new"
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Story</span>
        </Link>
      </div>

      {/* Responsive Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search stories by headline..."
            className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            aria-label="Search stories"
          />

          <select
            name="status"
            defaultValue={status || ""}
            className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            aria-label="Filter by status"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            name="category"
            defaultValue={categoryId || ""}
            className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow"
            >
              Filter
            </button>
            {(search || status || categoryId) && (
              <a
                href="/admin/stories"
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Clear
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Responsive Table & Mobile Cards with Multi-Select & 3-Dots Dropdown */}
      <StoriesTableClient stories={stories as any} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex justify-center">
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
  );
}
