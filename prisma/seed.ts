import { PrismaClient, Role, StoryStatus, ElementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rich production database...');

  // ─── Site Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'StoryFlow' },
    { key: 'site_description', value: 'Immerse yourself in full-screen visual stories from award-winning creators across travel, technology, food, culture, and science.' },
    { key: 'site_url', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
    { key: 'publisher_name', value: 'StoryFlow Media' },
    { key: 'publisher_logo', value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80' },
    { key: 'contact_email', value: 'hello@storyflow.com' },
    { key: 'footer_text', value: '© 2026 StoryFlow Media Inc. All rights reserved.' },
    { key: 'social_twitter', value: 'https://twitter.com/storyflow' },
    { key: 'social_instagram', value: 'https://instagram.com/storyflow' },
    { key: 'google_verification', value: '' },
    { key: 'default_seo_title', value: 'StoryFlow — Visual Web Stories Platform' },
    { key: 'default_seo_description', value: 'Discover immersive 9:16 visual Web Stories across trending topics, breaking news, travel, and tech.' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // ─── Admin User ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@12345', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@storyflow.com' },
    update: {},
    create: {
      email: 'admin@storyflow.com',
      name: 'Elena Rostova',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // ─── Authors ──────────────────────────────────────────────────────────────
  const authorsData = [
    {
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      bio: 'National Geographic contributor & visual documentary photographer traveling remote corners of the globe.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      twitter: 'https://twitter.com/sarahjohnson',
      instagram: 'https://instagram.com/sarah.visuals',
      website: 'https://sarahjohnson.photos',
      userId: adminUser.id,
    },
    {
      name: 'Alex Chen',
      slug: 'alex-chen',
      bio: 'Senior Technology Editor exploring generative AI, quantum computing, and ethical robotics.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      twitter: 'https://twitter.com/alexchen_tech',
      linkedin: 'https://linkedin.com/in/alexchen',
      website: 'https://alexchen.dev',
    },
    {
      name: 'Priya Sharma',
      slug: 'priya-sharma',
      bio: 'Michelin-guide culinary explorer documenting street food rituals and heritage gastronomy.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      instagram: 'https://instagram.com/priyastreetfood',
      website: 'https://priyasharma.kitchen',
    },
    {
      name: 'Marcus Vance',
      slug: 'marcus-vance',
      bio: 'Architectural critic, urban explorer, and sustainable living advocate based in Copenhagen.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      twitter: 'https://twitter.com/marcusvance',
    },
  ];

  const authors: Record<string, any> = {};
  for (const a of authorsData) {
    authors[a.slug] = await prisma.author.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }

  // ─── Categories ───────────────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Travel', slug: 'travel', description: 'Hidden gems, mountain treks, and tropical expeditions', color: '#0ea5e9', order: 1 },
    { name: 'Technology', slug: 'technology', description: 'Artificial Intelligence, gadgets, space & futurism', color: '#8b5cf6', order: 2 },
    { name: 'Food & Dining', slug: 'food', description: 'Street food culture, chef recipes & culinary journeys', color: '#f59e0b', order: 3 },
    { name: 'Lifestyle', slug: 'lifestyle', description: 'Wellness, productivity, mindfulness & modern culture', color: '#10b981', order: 4 },
    { name: 'Architecture', slug: 'architecture', description: 'Modernist structures, bioclimatic spaces & urban design', color: '#6366f1', order: 5 },
    { name: 'Nature & Wildlife', slug: 'nature', description: 'Ocean depths, rainforest sanctuaries & rare fauna', color: '#14b8a6', order: 6 },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const tagsData = [
    'wanderlust', 'photography', 'artificial-intelligence', 'street-food',
    'sustainability', 'minimalism', 'future-tech', 'nature', 'design', 'wellness'
  ];

  const tags: Record<string, any> = {};
  for (const t of tagsData) {
    tags[t] = await prisma.tag.upsert({
      where: { slug: t },
      update: {},
      create: { name: t, slug: t },
    });
  }

  // ─── 12 High-Quality Visual Stories ───────────────────────────────────────
  const stories = [
    {
      title: 'USA Daily: Massive Wildfire Hits California & Special Edition',
      slug: 'usa-daily-breaking-news-special-edition',
      description: 'Comprehensive vertical visual briefing covering California wildfires, education policies, jobs reports, and live storm trackers.',
      excerpt: 'Massive Wildfire Hits California, New Student Loan Plan, May Jobs Report, and Live Storm Updates.',
      coverImage: 'https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: true,
      authorId: authors['alex-chen'].id,
      categoryId: categories['technology']?.id || categories['travel'].id,
      viewCount: 38400,
      publishedAt: new Date(),
      pages: [
        {
          order: 0,
          background: '#0c0d12',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                src: 'https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80',
                layoutMeta: {
                  layoutType: 'breaking-news',
                  badgeText: 'BREAKING NEWS',
                  locationDate: 'JUNE 1, 2024 | CALIFORNIA, USA',
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'MASSIVE WILDFIRE HITS CALIFORNIA' },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Thousands evacuated as firefighters battle the blaze across state canyons' },
            },
          ],
        },
        {
          order: 1,
          background: '#f7f4ed',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80',
                layoutMeta: {
                  layoutType: 'news-explainer',
                  badgeText: 'EXPLAINER',
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'What You Need to Know About The New Student Loan Plan' },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'The U.S. Department of Education has announced a major update to the student loan forgiveness program.' },
            },
          ],
        },
        {
          order: 2,
          background: '#000000',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80',
                layoutMeta: {
                  layoutType: 'photo-news',
                  badgeText: 'U.S. NEWS',
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Foggy Morning in San Francisco' },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'A beautiful start to the day in the Bay Area.' },
            },
          ],
        },
        {
          order: 3,
          background: '#070d1d',
          duration: 8,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                layoutMeta: {
                  layoutType: 'data-facts',
                  badgeText: 'U.S. ECONOMY UPDATE',
                  sourceText: 'Source: U.S. Bureau of Labor Statistics',
                  statsList: [
                    { icon: 'users', stat: '272K', label: 'Jobs added in May', subtext: 'vs. 165K in April' },
                    { icon: 'trending', stat: '3.9%', label: 'Unemployment Rate', subtext: 'Unchanged from April' },
                    { icon: 'dollar', stat: '4.1%', label: 'Average Hourly Earnings', subtext: 'vs. May 2023' },
                    { icon: 'briefcase', stat: '8.1M', label: 'Job Openings', subtext: 'at the end of April' },
                  ],
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'May Jobs Report Key Highlights' },
            },
          ],
        },
        {
          order: 4,
          background: '#0d0f15',
          duration: 8,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                layoutMeta: {
                  layoutType: 'live-update',
                  badgeText: '🔴 LIVE UPDATE',
                  locationDate: 'May 31, 2024',
                  timelineList: [
                    { time: '2:45 PM', text: 'Severe storms reported in Texas and Oklahoma.' },
                    { time: '3:30 PM', text: 'Tornado warnings issued for 6 states.' },
                    { time: '4:10 PM', text: 'Over 120,000 customers without power.' },
                    { time: '4:45 PM', text: 'Rescue operations underway in affected areas.' },
                  ],
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'What We Know So Far' },
            },
          ],
        },
        {
          order: 5,
          background: '#0a060e',
          duration: 8,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80',
                layoutMeta: {
                  layoutType: 'entertainment-magazine',
                  badgeText: 'ENTERTAINMENT',
                  subheadText: 'Stars in New Blockbuster Movie',
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Zendaya' },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Everything we know about the highly anticipated film.' },
            },
            {
              type: ElementType.CTA,
              content: { label: 'SWIPE UP FOR DETAILS', url: '/stories' },
            },
          ],
        },
        {
          order: 6,
          background: '#090d16',
          duration: 8,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: {
                layoutMeta: {
                  layoutType: 'cta-finale',
                },
              },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Follow Live Coverage on USA Daily' },
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Get real-time breaking news alerts and in-depth visual journalism on your mobile device.' },
            },
            {
              type: ElementType.CTA,
              content: { label: 'Read Full Investigation', url: '/stories' },
            },
          ],
        },
      ],
    },
    {
      title: '10 Hidden Coastal Gems in India You Must Visit',
      slug: '10-hidden-beaches-in-india',
      description: 'Discover India’s most secluded and breathtaking coastlines away from the tourist crowds.',
      excerpt: 'From Goa’s secret coves to Kerala’s golden cliff shores, explore the untouched coastlines of India.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['sarah-johnson'].id,
      categoryId: categories['travel'].id,
      viewCount: 14820,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      pages: [
        {
          order: 0,
          background: '#0a192f',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.9 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: '10 Hidden Coastal Gems in India' },
              position: { x: 8, y: 62 },
              size: { width: 84, height: 25 },
              style: { fontSize: 32, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, textShadow: '0 4px 16px rgba(0,0,0,0.8)' },
              order: 1,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Untouched beaches, secret lagoons & golden cliffs.' },
              position: { x: 8, y: 82 },
              size: { width: 84, height: 15 },
              style: { fontSize: 16, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.4, textShadow: '0 2px 8px rgba(0,0,0,0.8)' },
              order: 2,
            },
          ],
        },
        {
          order: 1,
          background: '#021B2B',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: '01. Butterfly Beach, Goa' },
              position: { x: 8, y: 15 },
              size: { width: 84, height: 15 },
              style: { fontSize: 26, fontWeight: 800, color: '#38bdf8', lineHeight: 1.2, textShadow: '0 3px 12px rgba(0,0,0,0.9)' },
              order: 1,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Accessible only by boat or a deep forest trek, this secluded semi-circle bay is famed for playful dolphins at dawn and thousands of coastal butterflies.' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 28 },
              style: { fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: 1.5, textShadow: '0 3px 12px rgba(0,0,0,0.9)' },
              order: 2,
            },
          ],
        },
        {
          order: 2,
          background: '#0F2C27',
          duration: 8,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: '02. Marari Beach, Kerala' },
              position: { x: 8, y: 15 },
              size: { width: 84, height: 15 },
              style: { fontSize: 26, fontWeight: 800, color: '#34d399', lineHeight: 1.2, textShadow: '0 3px 12px rgba(0,0,0,0.9)' },
              order: 1,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'A tranquil fishing village beach lined with coconut palms and ayurvedic sanctuaries. Experience slow living by the Arabian Sea.' },
              position: { x: 8, y: 65 },
              size: { width: 84, height: 20 },
              style: { fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: 1.5, textShadow: '0 3px 12px rgba(0,0,0,0.9)' },
              order: 2,
            },
            {
              type: ElementType.CTA,
              content: { label: 'Explore Travel Guide', url: '/category/travel' },
              position: { x: 15, y: 88 },
              size: { width: 70, height: 8 },
              style: { backgroundColor: '#ffffff', color: '#0f172a', borderRadius: 9999 },
              order: 3,
            },
          ],
        },
      ],
    },
    {
      title: 'How Generative AI is Reshaping Architecture',
      slug: 'ai-reshaping-architecture',
      description: 'Parametric algorithms and neural networks are designing buildings we once considered impossible.',
      excerpt: 'From self-cooling facades to organic biomimetic sky-gardens, see the future of urban construction.',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: true,
      authorId: authors['alex-chen'].id,
      categoryId: categories['technology'].id,
      viewCount: 11290,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      pages: [
        {
          order: 0,
          background: '#090d16',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Generative AI Meets Modern Architecture' },
              position: { x: 8, y: 65 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, textShadow: '0 4px 16px rgba(0,0,0,0.8)' },
              order: 1,
            },
          ],
        },
        {
          order: 1,
          background: '#111827',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Biomimicry by Algorithms' },
              position: { x: 8, y: 15 },
              size: { width: 84, height: 15 },
              style: { fontSize: 26, fontWeight: 800, color: '#c084fc', lineHeight: 1.2 },
              order: 1,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'AI models simulate millions of sun angles and wind vortexes to sculpt aerodynamic structures that reduce cooling costs by up to 40%.' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 16, fontWeight: 500, color: '#f3f4f6', lineHeight: 1.5 },
              order: 2,
            },
          ],
        },
      ],
    },
    {
      title: 'The Legendary Midnight Food Trail of Old Delhi',
      slug: 'midnight-food-trail-old-delhi',
      description: 'A sensory journey through the fragrant alleys of Chandni Chowk after dusk.',
      excerpt: 'Kebabs sizzling over coal fires, rich slow-cooked Nihari, and century-old jalebi syrup cauldrons.',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: true,
      authorId: authors['priya-sharma'].id,
      categoryId: categories['food'].id,
      viewCount: 9450,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      pages: [
        {
          order: 0,
          background: '#2b1008',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.9 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Midnight Food Trail: Old Delhi' },
              position: { x: 8, y: 65 },
              size: { width: 84, height: 25 },
              style: { fontSize: 32, fontWeight: 800, color: '#fef08a', lineHeight: 1.2, textShadow: '0 4px 16px rgba(0,0,0,0.9)' },
              order: 1,
            },
          ],
        },
        {
          order: 1,
          background: '#1c1005',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Slow-Cooked Heritage' },
              position: { x: 8, y: 15 },
              size: { width: 84, height: 15 },
              style: { fontSize: 26, fontWeight: 800, color: '#fb923c' },
              order: 1,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Under flickering streetlights near Jama Masjid, spice masters craft copper pot recipes unchanged since the 17th century Mughal dynasty.' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: 1.5 },
              order: 2,
            },
          ],
        },
      ],
    },
    {
      title: '7 Science-Backed Habits of High Performers',
      slug: 'science-backed-habits-high-performers',
      description: 'How Nobel laureates and Olympic athletes optimize focus, sleep, and recovery.',
      excerpt: 'Circadian light exposure, non-sleep deep rest, and intentional boredom.',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['alex-chen'].id,
      categoryId: categories['lifestyle'].id,
      viewCount: 8120,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      pages: [
        {
          order: 0,
          background: '#0d1821',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'The Science of High Performance' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'Nordic Minimalism: Living with Less in Sweden',
      slug: 'nordic-minimalism-sweden',
      description: 'An intimate look into Swedish Lagom and architectural harmony with nature.',
      excerpt: 'Why embracing simplicity and sustainable timber creates deeper everyday happiness.',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['marcus-vance'].id,
      categoryId: categories['architecture'].id,
      viewCount: 6730,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
      pages: [
        {
          order: 0,
          background: '#1c1f24',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'The Art of Swedish Lagom' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'The Secret Night Life of Bioluminescent Forests',
      slug: 'bioluminescent-forests',
      description: 'Witness glowing fungi, firefly sanctuaries, and natural light spectacles in Japan.',
      excerpt: 'Deep in the ancient cedar groves of Yakushima, the forest glows with ethereal green light.',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['sarah-johnson'].id,
      categoryId: categories['nature'].id,
      viewCount: 7540,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      pages: [
        {
          order: 0,
          background: '#041f1a',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.9 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'When Ancient Forests Glow' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#4ade80', lineHeight: 1.2 },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'Next-Gen Quantum Chips: What You Need to Know',
      slug: 'next-gen-quantum-chips',
      description: 'How subatomic qubit processing is about to unlock drug discovery and encryption breakthroughs.',
      excerpt: 'Silicon gave us the digital age. Quantum superposition will define the next century.',
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['alex-chen'].id,
      categoryId: categories['technology'].id,
      viewCount: 5410,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 84),
      pages: [
        {
          order: 0,
          background: '#0a0a1a',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.85 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'The Dawn of Quantum Chips' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#818cf8', lineHeight: 1.2 },
              order: 1,
            },
          ],
        },
      ],
    },
    {
      title: 'The Artisans of Kyoto: 500-Year-Old Crafts',
      slug: 'artisans-of-kyoto',
      description: 'Inside the quiet wooden workshops preserving lacquerware, swordsmithing, and hand-woven silk.',
      excerpt: 'Master craftspeople dedicated to perfection over generations of heritage.',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: authors['sarah-johnson'].id,
      categoryId: categories['travel'].id,
      viewCount: 6890,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
      pages: [
        {
          order: 0,
          background: '#241715',
          duration: 7,
          elements: [
            {
              type: ElementType.BACKGROUND,
              content: { src: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80', fit: 'cover' },
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
              style: { opacity: 0.9 },
              order: 0,
            },
            {
              type: ElementType.TEXT,
              content: { text: 'Masters of Ancient Kyoto' },
              position: { x: 8, y: 68 },
              size: { width: 84, height: 25 },
              style: { fontSize: 30, fontWeight: 800, color: '#fed7aa', lineHeight: 1.2 },
              order: 1,
            },
          ],
        },
      ],
    },
  ];

  for (const s of stories) {
    const { pages: storyPages, ...storyMeta } = s;
    const story = await prisma.story.upsert({
      where: { slug: storyMeta.slug },
      update: {
        ...storyMeta,
        canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/story/${storyMeta.slug}`,
      },
      create: {
        ...storyMeta,
        canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/story/${storyMeta.slug}`,
      },
    });

    // Delete existing pages to re-insert cleanly
    await prisma.storyPage.deleteMany({ where: { storyId: story.id } });

    for (const p of storyPages) {
      const page = await prisma.storyPage.create({
        data: {
          storyId: story.id,
          order: p.order,
          background: p.background,
          duration: p.duration,
        },
      });

      for (let elIdx = 0; elIdx < p.elements.length; elIdx++) {
        const el = p.elements[elIdx] as any;
        await prisma.storyElement.create({
          data: {
            pageId: page.id,
            type: el.type,
            content: el.content || {},
            position: el.position || { x: 0, y: 0 },
            size: el.size || { width: 100, height: 100 },
            style: el.style || {},
            order: el.order ?? elIdx,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${stories.length} rich multi-page visual stories`);
  console.log('🎉 Production database ready!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
