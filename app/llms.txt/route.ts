import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { StoryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  const baseUrl = settings.site_url || "http://localhost:3000";

  const [categories, stories] = await Promise.all([
    prisma.category.findMany({ select: { name: true, slug: true, description: true } }).catch(() => []),
    prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      select: { title: true, slug: true, description: true, category: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 25,
    }).catch(() => []),
  ]);

  const categoryList = categories
    .map((c) => `- [${c.name}](${baseUrl}/category/${c.slug}): ${c.description || `${c.name} Web Stories`}`)
    .join("\n");

  const storyList = stories
    .map((s) => `- [${s.title}](${baseUrl}/story/${s.slug}) (${s.category.name}): ${s.description || s.title}`)
    .join("\n");

  const content = `# ${settings.site_name}

> ${settings.site_description}

${settings.site_name} publishes immersive, verified 9:16 Google Web Stories covering breaking news, emerging technologies, lifestyle, travel, and cultural narratives.

## Core Feeds & Endpoints
- [XML Sitemap](${baseUrl}/sitemap.xml): Machine-readable index of all visual stories, AMP versions, and taxonomy.
- [RSS Feed](${baseUrl}/feed.xml): Live syndication feed with full media enclosures for aggregators and search engines.
- [Web Stories Library](${baseUrl}/stories): Complete archive of published visual narratives.

## Major Topics & Categories
${categoryList || "- General Web Stories"}

## Latest Visual Stories
${storyList || "- No visual stories published yet."}

## Contact & Editorial Guidelines
- Publisher: ${settings.publisher_name}
- Email: ${settings.contact_email}
- Website: ${baseUrl}
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
