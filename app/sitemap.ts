import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { StoryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const baseUrl = settings.site_url || "http://localhost:3000";

  // Static core routes
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/stories`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/latest`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    // Published stories (both canonical HTML and Google AMP endpoints)
    const stories = await prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    const storyUrls: MetadataRoute.Sitemap = [];
    for (const story of stories) {
      // Standard Canonical Web Story
      storyUrls.push({
        url: `${baseUrl}/story/${story.slug}`,
        lastModified: story.updatedAt,
        changeFrequency: "daily",
        priority: 0.9,
      });

      // Google AMP Web Story
      storyUrls.push({
        url: `${baseUrl}/story/${story.slug}/amp`,
        lastModified: story.updatedAt,
        changeFrequency: "daily",
        priority: 0.95, // Higher priority for Google Discover crawlers
      });
    }

    // Categories
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    // Authors
    const authors = await prisma.author.findMany({
      select: { slug: true, updatedAt: true },
    });

    const authorUrls: MetadataRoute.Sitemap = authors.map((a) => ({
      url: `${baseUrl}/author/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...storyUrls, ...categoryUrls, ...authorUrls];
  } catch {
    return staticPages;
  }
}
