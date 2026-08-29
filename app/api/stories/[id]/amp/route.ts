import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const [story, settings] = await Promise.all([
    prisma.story.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        author: true,
        category: true,
        pages: {
          orderBy: { order: "asc" },
          include: { elements: { orderBy: { order: "asc" } } },
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!story) {
    return new NextResponse("Story not found", { status: 404 });
  }

  const canonicalUrl = story.canonicalUrl || absoluteUrl(`/story/${story.slug}`);
  const publisherLogo = settings.logo_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=192&h=192&q=80";
  const posterPortrait = story.coverImage || "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80";

  // Google Structured Data for WebStory
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: canonicalUrl,
    headline: story.title,
    description: story.description || story.excerpt || story.title,
    image: [posterPortrait],
    datePublished: story.publishedAt ? new Date(story.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: story.updatedAt ? new Date(story.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: story.author.name,
      url: absoluteUrl(`/author/${story.author.slug}`),
    },
    publisher: {
      "@type": "Organization",
      name: settings.publisher_name || "USA DAILY",
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
  };

  // Generate 100% Valid Google AMP Web Story HTML
  const ampHtml = `<!doctype html>
<html ⚡story lang="en">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(story.seoTitle || story.title)}</title>
    <link rel="canonical" href="${canonicalUrl}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    ${story.pages.some((p) => p.elements.some((e) => e.type === "VIDEO")) ? '<script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>' : ''}
    
    <!-- AMP Boilerplate -->
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    
    <!-- AMP Custom CSS -->
    <style amp-custom>
      amp-story {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        color: #ffffff;
      }
      .scrim-overlay {
        background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%);
        width: 100%;
        height: 100%;
        position: absolute;
        inset: 0;
      }
      .content-box {
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
        box-sizing: border-box;
      }
      .badge-pill {
        display: inline-block;
        background-color: #dc2626;
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 4px 10px;
        border-radius: 6px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        width: max-content;
      }
      .story-heading {
        color: #ffffff;
        font-size: 26px;
        font-weight: 900;
        line-height: 1.15;
        text-transform: uppercase;
        margin: 0 0 10px 0;
        text-shadow: 0 2px 14px rgba(0,0,0,0.95);
      }
      .story-description {
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.45;
        margin: 0 0 12px 0;
        text-shadow: 0 1px 8px rgba(0,0,0,0.9);
      }
      .dateline {
        color: #f87171;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-left: 2px solid #ef4444;
        padding-left: 8px;
        margin-bottom: 16px;
      }
      .amp-cta-container {
        margin-top: 14px;
      }
    </style>

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(structuredData)}
    </script>
  </head>
  <body>
    <amp-story
      standalone
      title="${escapeHtml(story.title)}"
      publisher="${escapeHtml(settings.publisher_name || 'USA DAILY')}"
      publisher-logo-src="${publisherLogo}"
      poster-portrait-src="${posterPortrait}"
    >
      ${story.pages
        .map((page, index) => {
          const bgElement = page.elements.find((e) => e.type === "BACKGROUND");
          const bgSrc = (bgElement?.content as { src?: string })?.src || posterPortrait;
          const meta = (bgElement?.content as any)?.layoutMeta || {};
          const textElements = page.elements.filter((e) => e.type === "TEXT");
          const ctaElement = page.elements.find((e) => e.type === "CTA");

          const heading = (textElements[0]?.content as { text?: string })?.text || "";
          const description = (textElements[1]?.content as { text?: string })?.text || "";
          const badge = meta.badgeText || (index === 0 ? "BREAKING NEWS" : "LIVE UPDATE");
          const dateline = meta.locationDate || "WASHINGTON, D.C. · LIVE DISPATCH";

          const hasCta = !!ctaElement && !!(ctaElement.content as any)?.url;
          const ctaUrl = hasCta ? (ctaElement.content as any).url : "";
          const ctaLabel = hasCta ? (ctaElement.content as any).label || "Swipe Up for Details" : "";

          return `
      <!-- Page ${index + 1} -->
      <amp-story-page id="page-${page.id || index + 1}" auto-advance-after="${page.duration || 7}s">
        <!-- Background Layer -->
        <amp-story-grid-layer template="fill">
          <amp-img src="${bgSrc}" width="720" height="1280" layout="responsive" alt="News Image"></amp-img>
          <div class="scrim-overlay"></div>
        </amp-story-grid-layer>

        <!-- Content Layer (Safe Margins above CTA) -->
        <amp-story-grid-layer template="vertical" class="content-box">
          <div class="badge-pill">${escapeHtml(badge)}</div>
          ${heading ? `<h2 class="story-heading">${escapeHtml(heading)}</h2>` : ""}
          ${description ? `<p class="story-description">${escapeHtml(description)}</p>` : ""}
          ${dateline ? `<div class="dateline">${escapeHtml(dateline)}</div>` : ""}
        </amp-story-grid-layer>

        <!-- Official Google AMP Outlink Layer for CTA -->
        ${
          hasCta
            ? `
        <amp-story-page-outlink layout="nodisplay" theme="custom" cta-accent-element="background" cta-accent-color="#dc2626">
          <a href="${escapeHtml(ctaUrl)}">${escapeHtml(ctaLabel)}</a>
        </amp-story-page-outlink>`
            : ""
        }
      </amp-story-page>`;
        })
        .join("\n")}
    </amp-story>
  </body>
</html>`;

  return new NextResponse(ampHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
