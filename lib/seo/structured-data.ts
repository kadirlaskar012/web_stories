import { Story, Author, Category } from '@prisma/client';
import { absoluteUrl } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';

type StoryWithRelations = Story & {
  author: Author;
  category: Category;
};

export function generateStoryJsonLd(story: StoryWithRelations, settings: SiteSettings) {
  const url = absoluteUrl(`/story/${story.slug}`);
  const publisherLogoUrl = settings.logo_url || absoluteUrl('/logo.png');

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.seoTitle || story.title,
    description: story.seoDescription || story.description || '',
    image: story.socialImage || story.coverImage || '',
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: story.publishedAt?.toISOString() || story.createdAt.toISOString(),
    dateModified: story.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: story.author.name,
      url: absoluteUrl(`/author/${story.author.slug}`),
    },
    publisher: {
      '@type': 'Organization',
      name: settings.publisher_name || settings.site_name,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogoUrl,
        width: 200,
        height: 60,
      },
    },
  };
}

export function generateWebSiteJsonLd(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.site_name,
    url: settings.site_url,
    description: settings.site_description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${settings.site_url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
