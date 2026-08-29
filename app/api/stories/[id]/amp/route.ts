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
  const publisherLogo = settings.logo_url || absoluteUrl("/icons/icon-96.png");
  const posterPortrait = story.coverImage || absoluteUrl("/images/default-poster.jpg");

  // Generate AMP Story HTML
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
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <style amp-custom>
      amp-story {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .text-element {
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        font-weight: 600;
        line-height: 1.4;
      }
      .cta-btn {
        background: #ffffff;
        color: #111827;
        font-weight: 700;
        font-size: 14px;
        padding: 12px 24px;
        border-radius: 9999px;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      }
    </style>
  </head>
  <body>
    <amp-story
      standalone
      title="${escapeHtml(story.title)}"
      publisher="${escapeHtml(settings.publisher_name)}"
      publisher-logo-src="${publisherLogo}"
      poster-portrait-src="${posterPortrait}"
    >
      ${story.pages
        .map((page, index) => {
          const bgImage = page.elements.find((e) => e.type === "BACKGROUND" && (e.content as { src?: string }).src);
          const bgSrc = bgImage ? (bgImage.content as { src: string }).src : null;
          const textElements = page.elements.filter((e) => e.type === "TEXT");
          const ctaElement = page.elements.find((e) => e.type === "CTA");

          return `
      <!-- Page ${index + 1} -->
      <amp-story-page id="page-${page.id || index + 1}" auto-advance-after="${page.duration || 7}s">
        <amp-story-grid-layer template="fill">
          ${
            bgSrc
              ? `<amp-img src="${bgSrc}" width="720" height="1280" layout="responsive" alt="Background"></amp-img>`
              : `<div style="background-color: ${page.background || '#000000'}; width: 100%; height: 100%;"></div>`
          }
        </amp-story-grid-layer>

        <amp-story-grid-layer template="vertical" class="bottom">
          ${textElements
            .map((el) => {
              const content = el.content as { text?: string };
              const style = el.style as Record<string, unknown>;
              return `<h2 class="text-element" style="font-size: ${style.fontSize || 24}px; color: ${style.color || '#ffffff'}; text-align: ${style.textAlign || 'left'};">${escapeHtml(content.text || '')}</h2>`;
            })
            .join("\n          ")}
          ${
            ctaElement
              ? `
          <div style="margin-top: 16px; text-align: center;">
            <a href="${(ctaElement.content as { url?: string }).url || '#'}" target="_blank" class="cta-btn">
              ${escapeHtml((ctaElement.content as { label?: string }).label || 'Learn More')}
            </a>
          </div>`
              : ""
          }
        </amp-story-grid-layer>
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
