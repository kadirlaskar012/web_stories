import { prisma } from '@/lib/db';

export type SiteSettings = {
  site_name: string;
  site_description: string;
  site_url: string;
  publisher_name: string;
  contact_email: string;
  footer_text: string;
  social_twitter: string;
  social_instagram: string;
  google_verification: string;
  default_seo_title: string;
  default_seo_description: string;
  logo_url?: string;
  favicon_url?: string;
  default_social_image?: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'StoryFlow',
  site_description: 'Premium Web Stories Publishing Platform',
  site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  publisher_name: 'StoryFlow Media',
  contact_email: 'hello@storyflow.com',
  footer_text: '© 2025 StoryFlow. All rights reserved.',
  social_twitter: '',
  social_instagram: '',
  google_verification: '',
  default_seo_title: 'StoryFlow — Premium Web Stories',
  default_seo_description: 'Discover engaging Web Stories across news, travel, food, technology, and more.',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value || '']));
    return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  await Promise.all(
    Object.entries(settings).map(([key, value]) => updateSetting(key, value))
  );
}
