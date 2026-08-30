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
  social_facebook?: string;
  ga_id?: string;
  adsense_publisher_id?: string;
  google_verification: string;
  bing_verification: string;
  pinterest_verification: string;
  yandex_verification: string;
  default_seo_title: string;
  default_seo_description: string;
  logo_url?: string;
  favicon_url?: string;
  default_social_image?: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'StoryPulse',
  site_description: 'Premium Web Stories Publishing Platform',
  site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  publisher_name: 'StoryPulse Media',
  contact_email: 'hello@storypulse.com',
  footer_text: '© 2026 StoryPulse Media. All rights reserved.',
  social_twitter: '',
  social_instagram: '',
  social_facebook: '',
  ga_id: '',
  adsense_publisher_id: '',
  google_verification: '',
  bing_verification: '',
  pinterest_verification: '',
  yandex_verification: '',
  default_seo_title: 'StoryPulse — Visual Web Stories Network',
  default_seo_description: 'Discover immersive 9:16 visual Web Stories across news, tech, culture, and lifestyle.',
};

let cachedSettings: { data: SiteSettings; timestamp: number } | null = null;

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cachedSettings && now - cachedSettings.timestamp < 60000) {
    return cachedSettings.data;
  }
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value || '']));
    const settings = { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
    cachedSettings = { data: settings, timestamp: now };
    return settings;
  } catch {
    return cachedSettings?.data || DEFAULT_SETTINGS;
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
  cachedSettings = null;
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  cachedSettings = null;
  await Promise.all(
    Object.entries(settings).map(([key, value]) => updateSetting(key, value))
  );
}
