import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { StoryStatus } from "@prisma/client";
import { Search, CheckCircle, AlertCircle, ExternalLink, Globe, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const [settings, storyCount, categoryCount, authorCount, missingCoverCount, missingDescCount] =
    await Promise.all([
      getSiteSettings(),
      prisma.story.count({ where: { status: StoryStatus.PUBLISHED } }),
      prisma.category.count(),
      prisma.author.count(),
      prisma.story.count({
        where: { status: StoryStatus.PUBLISHED, coverImage: null },
      }),
      prisma.story.count({
        where: {
          status: StoryStatus.PUBLISHED,
          OR: [{ description: null }, { description: "" }],
        },
      }),
    ]);

  const sitemapUrl = `${settings.site_url}/sitemap.xml`;
  const robotsUrl = `${settings.site_url}/robots.txt`;

  const checklist = [
    {
      label: "Canonical Domain Configured",
      passed: !!settings.site_url && settings.site_url !== "http://localhost:3000",
      detail: settings.site_url,
    },
    {
      label: "Dynamic Sitemap Available",
      passed: true,
      detail: `${storyCount} stories + ${categoryCount} categories + ${authorCount} authors indexed`,
      href: "/sitemap.xml",
    },
    {
      label: "Robots.txt Active",
      passed: true,
      detail: "Disallowing /admin and indexing sitemap.xml",
      href: "/robots.txt",
    },
    {
      label: "Publisher Organization Structured Data",
      passed: !!settings.publisher_name,
      detail: settings.publisher_name || "Publisher name missing in settings",
    },
    {
      label: "Story Cover Images (Poster requirements)",
      passed: missingCoverCount === 0,
      detail: missingCoverCount === 0 ? "All published stories have cover images" : `${missingCoverCount} stories missing cover image`,
    },
    {
      label: "Story Descriptions (Snippet meta)",
      passed: missingDescCount === 0,
      detail: missingDescCount === 0 ? "All published stories have meta descriptions" : `${missingDescCount} stories missing description`,
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO & Discoverability</h1>
        <p className="text-sm text-gray-500 mt-1">Audit search engine optimization, structured schema, and crawlability</p>
      </div>

      {/* Health score overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">SEO Checklist & Health Audit</h2>
        <div className="divide-y divide-gray-50">
          {checklist.map((item, i) => (
            <div key={i} className="py-3 flex items-start gap-3">
              {item.passed ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  {item.href && (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Inspect <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crawlers & Indexing */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">XML Sitemap</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Automatically generated and cached hourly. Includes all published stories, categories, and authors.
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            View /sitemap.xml <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">Robots.txt</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Configured to disallow search engine bots from admin and preview URLs while allowing public story routes.
          </p>
          <a
            href="/robots.txt"
            target="_blank"
            className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            View /robots.txt <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
