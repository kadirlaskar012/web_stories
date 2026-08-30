import { Story, Author, Category } from '@prisma/client';
import { absoluteUrl } from '@/lib/utils';
import { SiteSettings } from '@/lib/settings';

type StoryWithRelations = Story & {
  author: Author;
  category: Category;
};

export function generateStoryJsonLd(story: StoryWithRelations, settings: SiteSettings) {
  const url = absoluteUrl(`/story/${story.slug}`);
  const publisherLogoUrl = settings.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&q=80";
  const mainImage = story.socialImage || story.coverImage || "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1200&q=80";

  return {
    '@context': 'https://schema.org',
    '@type': ['NewsArticle', 'WebStory'],
    headline: story.seoTitle || story.title,
    description: story.seoDescription || story.description || story.excerpt || '',
    image: [
      mainImage,
      mainImage.replace('w=1200', 'w=1600&h=900'), // 16:9
      mainImage.replace('w=1200', 'w=1200&h=900'), // 4:3
      mainImage.replace('w=1200', 'w=1080&h=1080'), // 1:1
      mainImage.replace('w=1200', 'w=1080&h=1440'), // 3:4 portrait (Google Discover Favorite)
    ],
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
      url: settings.site_url,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogoUrl,
        width: 192,
        height: 192,
      },
    },
    articleSection: story.category.name,
    keywords: (story as any).tags?.map((t: any) => t.tag?.name || t.name).filter(Boolean).join(", ") || `${story.category.name}, visual stories, news`,
    inLanguage: 'en-US',
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
