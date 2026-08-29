import { prisma } from "@/lib/db";
import { StoryStatus } from "@prisma/client";
import { BarChart2, Eye, TrendingUp, BookOpen, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [categories, topStories, totalPublished, totalViewsAggregate] = await Promise.all([
    prisma.category.findMany({
      include: {
        stories: {
          where: { status: StoryStatus.PUBLISHED },
          select: { viewCount: true },
        },
      },
    }),
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      orderBy: { viewCount: "desc" },
      take: 10,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } },
      },
    }),
    prisma.story.count({ where: { status: StoryStatus.PUBLISHED } }),
    prisma.story.aggregate({ _sum: { viewCount: true } }),
  ]);

  const totalViews = totalViewsAggregate._sum.viewCount || 0;
  const avgViewsPerStory = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;

  const categoryStats = categories.map((c) => ({
    name: c.name,
    color: c.color || "#6366f1",
    count: c.stories.length,
    views: c.stories.reduce((sum, s) => sum + s.viewCount, 0),
  })).sort((a, b) => b.views - a.views);

  const maxViews = Math.max(...categoryStats.map((c) => c.views), 1);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time performance and audience engagement metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Story Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Published Stories</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalPublished.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Avg Views / Story</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{avgViewsPerStory.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Views by Category</h2>
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name} ({cat.count} stories)
                  </span>
                  <span className="text-gray-500 font-semibold">{cat.views.toLocaleString()} views</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(cat.views / maxViews) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <p className="text-xs text-gray-400 py-6 text-center">No category data available</p>
            )}
          </div>
        </div>

        {/* Top 10 Performing Stories */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top 10 Performing Stories</h2>
          <div className="divide-y divide-gray-50">
            {topStories.map((story, i) => (
              <div key={story.id} className="py-2.5 flex items-center gap-3">
                <span className="text-sm font-black text-gray-300 w-5 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/story/${story.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-gray-900 hover:text-blue-600 truncate block"
                  >
                    {story.title}
                  </Link>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {story.category.name} · by {story.author.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">{story.viewCount.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 block">views</span>
                </div>
              </div>
            ))}
            {topStories.length === 0 && (
              <p className="text-xs text-gray-400 py-6 text-center">No stories published yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
