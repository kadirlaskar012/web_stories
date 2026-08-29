import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { StoryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  const baseUrl = settings.site_url || "http://localhost:3000";

  const stories = await prisma.story
    .findMany({
      where: { status: StoryStatus.PUBLISHED },
      include: {
        author: true,
        category: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
    })
    .catch(() => []);

  const rssItems = stories
    .map((story) => {
      const pubDate = story.publishedAt ? new Date(story.publishedAt).toUTCString() : new Date().toUTCString();
      const storyUrl = `${baseUrl}/story/${story.slug}`;
      const ampUrl = `${baseUrl}/story/${story.slug}/amp`;
      const cover = story.coverImage || "";

      return `
    <item>
      <title><![CDATA[${story.title}]]></title>
      <link>${storyUrl}</link>
      <guid isPermaLink="true">${storyUrl}</guid>
      <description><![CDATA[${story.description || story.excerpt || story.title}]]></description>
      <category><![CDATA[${story.category.name}]]></category>
      <dc:creator><![CDATA[${story.author.name}]]></dc:creator>
      <pubDate>${pubDate}</pubDate>
      <amp:story>${ampUrl}</amp:story>
      ${cover ? `<enclosure url="${cover}" length="0" type="image/jpeg" />` : ""}
      ${cover ? `<media:content url="${cover}" medium="image" />` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/" 
  xmlns:dc="http://purl.org/dc/elements/1.1/" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:amp="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${settings.site_name} — Visual Web Stories Feed]]></title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description><![CDATA[${settings.site_description}]]></description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
