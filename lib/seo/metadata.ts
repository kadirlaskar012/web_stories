import { Story, Author, Category } from '@prisma/client';
import { Metadata } from 'next';
import { absoluteUrl } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';

type StoryWithRelations = Story & {
  author: Author;
  category: Category;
  tags?: { tag: { name: string } }[];
};

export function generateStoryMetadata(
  story: StoryWithRelations,
  settings: SiteSettings
): Metadata {
  const title = story.seoTitle || story.title;
  const description = story.seoDescription || story.description || settings.default_seo_description;
  const url = absoluteUrl(`/story/${story.slug}`);
  const ampUrl = absoluteUrl(`/api/stories/${story.slug}/amp`);
  const image = story.socialImage || story.coverImage || settings.default_social_image || '';
  const keywords = story.tags?.map((t) => t.tag?.name).filter(Boolean) || [story.category.name, settings.site_name, "web stories", "visual news"];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: story.canonicalUrl || url,
      types: {
        'application/amp+html': ampUrl,
      },
    },
    other: {
      amphtml: ampUrl,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: story.publishedAt?.toISOString(),
      modifiedTime: story.updatedAt.toISOString(),
      authors: [absoluteUrl(`/author/${story.author.slug}`)],
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      siteName: settings.site_name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: story.robotsMeta || 'index,follow',
  };
}

export function generateCategoryMetadata(
  category: Category,
  settings: SiteSettings
): Metadata {
  const title = category.seoTitle || `${category.name} Stories | ${settings.site_name}`;
  const description = category.seoDescription || category.description || settings.default_seo_description;
  const url = absoluteUrl(`/category/${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: settings.site_name,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function generateAuthorMetadata(
  author: Author,
  settings: SiteSettings
): Metadata {
  const title = `${author.name} | ${settings.site_name}`;
  const description = author.bio || `Stories by ${author.name} on ${settings.site_name}`;
  const url = absoluteUrl(`/author/${author.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      siteName: settings.site_name,
      images: author.avatar ? [{ url: author.avatar, width: 400, height: 400, alt: author.name }] : [],
    },
    twitter: { card: 'summary', title, description },
  };
}
