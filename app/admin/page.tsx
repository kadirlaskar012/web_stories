import { prisma } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { StoryStatus } from "@prisma/client";
import { formatRelativeDate } from "@/lib/utils";
import {
  BookOpen,
  Eye,
  FileText,
  Clock,
  Archive,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [storyCounts, recentStories, topStories, recentActivity] =
    await Promise.all([
      // Story counts by status
      prisma.story.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // Recent stories
      prisma.story.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, color: true } },
        },
      }),
      // Top stories by views
      prisma.story.findMany({
        where: { status: StoryStatus.PUBLISHED, viewCount: { gt: 0 } },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true, category: { select: { name: true } } },
      }),
      // Recent activity
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const countMap = Object.fromEntries(
    storyCounts.map((g) => [g.status, g._count._all])
  );

  const totalViews = await prisma.story.aggregate({
    _sum: { viewCount: true },
  });

  const stats = [
    {
      label: "Total Stories",
      value: Object.values(countMap).reduce((a, b) => a + b, 0),
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Published",
      value: countMap[StoryStatus.PUBLISHED] || 0,
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Drafts",
      value: countMap[StoryStatus.DRAFT] || 0,
      icon: FileText,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    {
      label: "Scheduled",
      value: countMap[StoryStatus.SCHEDULED] || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Views",
      value: (totalViews._sum.viewCount || 0).toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Archived",
      value: countMap[StoryStatus.ARCHIVED] || 0,
      icon: Archive,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your publishing activity</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Story
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Stories</h2>
            <Link
              href="/admin/stories"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentStories.length > 0 ? (
              recentStories.map((story) => (
                <div key={story.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {story.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {story.author.name} · {formatRelativeDate(story.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={story.status} />
                  <Link
                    href={`/admin/stories/${story.id}/edit`}
                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                    aria-label={`Edit story: ${story.title}`}
                  >
                    Edit
                  </Link>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">
                No stories yet.{" "}
                <Link href="/admin/stories/new" className="text-blue-600">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Top Stories */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Top Stories by Views</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topStories.length > 0 ? (
              topStories.map((story, i) => (
                <div key={story.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xl font-black text-gray-200 w-6 text-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {story.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {story.category.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    {story.viewCount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">
                No view data yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    {log.user?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.user?.name || "System"}</span>{" "}
                      <span className="lowercase">{log.action.replace(/_/g, " ")}</span>
                      {log.entityType && (
                        <span className="text-gray-400"> · {log.entityType}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatRelativeDate(log.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">
                No activity recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
