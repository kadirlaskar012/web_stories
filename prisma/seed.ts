import { PrismaClient, Role, StoryStatus, ElementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Site Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'StoryFlow' },
    { key: 'site_description', value: 'Premium Web Stories Publishing Platform' },
    { key: 'site_url', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
    { key: 'publisher_name', value: 'StoryFlow Media' },
    { key: 'contact_email', value: 'hello@storyflow.com' },
    { key: 'footer_text', value: '© 2025 StoryFlow. All rights reserved.' },
    { key: 'social_twitter', value: 'https://twitter.com/storyflow' },
    { key: 'social_instagram', value: 'https://instagram.com/storyflow' },
    { key: 'google_verification', value: '' },
    { key: 'default_seo_title', value: 'StoryFlow — Premium Web Stories' },
    { key: 'default_seo_description', value: 'Discover engaging Web Stories across news, travel, food, technology, and more.' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Site settings seeded');

  // ─── Admin User ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@12345', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@storyflow.com' },
    update: {},
    create: {
      email: 'admin@storyflow.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created: admin@storyflow.com / Admin@12345');

  // ─── Authors ──────────────────────────────────────────────────────────────
  const author1 = await prisma.author.upsert({
    where: { slug: 'sarah-johnson' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      slug: 'sarah-johnson',
      bio: 'Travel writer and photographer exploring the world one story at a time.',
      twitter: 'https://twitter.com/sarahjohnson',
      website: 'https://sarahjohnson.com',
      userId: adminUser.id,
    },
  });

  const author2 = await prisma.author.upsert({
    where: { slug: 'james-chen' },
    update: {},
    create: {
      name: 'James Chen',
      slug: 'james-chen',
      bio: 'Tech journalist covering the intersection of design and technology.',
      twitter: 'https://twitter.com/jameschen',
    },
  });

  const author3 = await prisma.author.upsert({
    where: { slug: 'priya-sharma' },
    update: {},
    create: {
      name: 'Priya Sharma',
      slug: 'priya-sharma',
      bio: 'Food enthusiast and culinary storyteller from Mumbai.',
      instagram: 'https://instagram.com/priyasharma',
    },
  });

  console.log('✅ Authors seeded');

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { name: 'Travel', slug: 'travel', description: 'Discover the world\'s most breathtaking destinations', color: '#0ea5e9', order: 1 },
    { name: 'Technology', slug: 'technology', description: 'The latest in tech, AI, and digital innovation', color: '#8b5cf6', order: 2 },
    { name: 'Food', slug: 'food', description: 'Culinary adventures and gastronomic delights', color: '#f59e0b', order: 3 },
    { name: 'Lifestyle', slug: 'lifestyle', description: 'Living well and thriving in the modern world', color: '#10b981', order: 4 },
    { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, culture, and celebrity stories', color: '#ec4899', order: 5 },
    { name: 'News', slug: 'news', description: 'Breaking news and in-depth reporting', color: '#ef4444', order: 6 },
    { name: 'Sports', slug: 'sports', description: 'Sports highlights, athlete stories, and game analysis', color: '#f97316', order: 7 },
    { name: 'Business', slug: 'business', description: 'Business insights, entrepreneurship, and market trends', color: '#3b82f6', order: 8 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('✅ Categories seeded');

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const tags = [
    { name: 'India', slug: 'india' },
    { name: 'Beach', slug: 'beach' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Hidden Gems', slug: 'hidden-gems' },
    { name: 'AI', slug: 'ai' },
    { name: 'Startup', slug: 'startup' },
    { name: 'Recipe', slug: 'recipe' },
    { name: 'Wellness', slug: 'wellness' },
  ];

  const tagMap: Record<string, string> = {};
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tagMap[tag.slug] = created.id;
  }
  console.log('✅ Tags seeded');

  // ─── Sample Stories ───────────────────────────────────────────────────────
  const sampleStories = [
    {
      title: '10 Hidden Beaches in India You Must Visit',
      slug: '10-hidden-beaches-in-india',
      description: 'Discover India\'s most secluded and breathtaking coastal gems away from the tourist crowds.',
      excerpt: 'India\'s coastline stretches over 7,500 km, hiding some of the world\'s most pristine beaches.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: true,
      authorId: author1.id,
      categoryId: categoryMap['travel'],
      viewCount: 4230,
      seoTitle: '10 Hidden Beaches in India You Must Visit | StoryFlow',
      seoDescription: 'Explore 10 secret beach destinations in India that most tourists never discover. From Goa\'s hidden coves to Kerala\'s pristine shores.',
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'The Future of AI in Creative Industries',
      slug: 'future-of-ai-creative-industries',
      description: 'How artificial intelligence is transforming art, music, writing, and design.',
      excerpt: 'AI tools are rapidly changing the landscape of creative work — but what does this mean for human creativity?',
      coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: author2.id,
      categoryId: categoryMap['technology'],
      viewCount: 3120,
      seoTitle: 'The Future of AI in Creative Industries | StoryFlow',
      seoDescription: 'Explore how AI is transforming art, music, writing, and design — and what it means for human creativity.',
      publishedAt: new Date('2025-01-20'),
    },
    {
      title: '5 Street Foods of Mumbai You Cannot Miss',
      slug: '5-street-foods-of-mumbai',
      description: 'A culinary journey through Mumbai\'s vibrant street food scene.',
      excerpt: 'From Vada Pav to Pav Bhaji — Mumbai\'s street food is a flavor explosion waiting to be discovered.',
      coverImage: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: false,
      authorId: author3.id,
      categoryId: categoryMap['food'],
      viewCount: 2850,
      seoTitle: '5 Street Foods of Mumbai You Cannot Miss | StoryFlow',
      seoDescription: 'Discover the best street food in Mumbai — a complete guide to vada pav, pav bhaji, bhel puri, and more.',
      publishedAt: new Date('2025-01-25'),
    },
    {
      title: 'Morning Routines of the World\'s Most Successful People',
      slug: 'morning-routines-successful-people',
      description: 'Science-backed habits that top performers use to start their day.',
      excerpt: 'The first hour of the day sets the tone for everything that follows.',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      status: StoryStatus.PUBLISHED,
      isFeatured: true,
      authorId: author1.id,
      categoryId: categoryMap['lifestyle'],
      viewCount: 5680,
      seoTitle: 'Morning Routines of the World\'s Most Successful People | StoryFlow',
      seoDescription: 'Discover the morning habits of successful entrepreneurs, athletes, and leaders — backed by science.',
      publishedAt: new Date('2025-02-01'),
    },
    {
      title: 'Electric Vehicles: The Road Ahead',
      slug: 'electric-vehicles-road-ahead',
      description: 'The EV revolution is accelerating. Here\'s what 2025 looks like for electric mobility.',
      excerpt: 'With battery costs plummeting and infrastructure expanding, the EV era is truly here.',
      coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
      status: StoryStatus.DRAFT,
      isFeatured: false,
      authorId: author2.id,
      categoryId: categoryMap['technology'],
      viewCount: 0,
      seoTitle: 'Electric Vehicles: The Road Ahead in 2025 | StoryFlow',
      seoDescription: 'A deep dive into the electric vehicle revolution — new models, charging networks, and what\'s coming next.',
    },
  ];

  for (const storyData of sampleStories) {
    await prisma.story.upsert({
      where: { slug: storyData.slug },
      update: {},
      create: {
        ...storyData,
        canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/story/${storyData.slug}`,
        pages: {
          create: [
            {
              order: 0,
              background: '#1a1a2e',
              duration: 7,
              elements: {
                create: [
                  {
                    type: ElementType.BACKGROUND,
                    content: { src: storyData.coverImage, fit: 'cover' },
                    position: { x: 0, y: 0 },
                    size: { width: 100, height: 100 },
                    style: { opacity: 0.8 },
                    order: 0,
                  },
                  {
                    type: ElementType.TEXT,
                    content: { text: storyData.title },
                    position: { x: 5, y: 65 },
                    size: { width: 90, height: 30 },
                    style: {
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    },
                    order: 1,
                  },
                ],
              },
            },
            {
              order: 1,
              background: '#16213e',
              duration: 8,
              elements: {
                create: [
                  {
                    type: ElementType.TEXT,
                    content: { text: storyData.description || storyData.excerpt || '' },
                    position: { x: 8, y: 20 },
                    size: { width: 84, height: 60 },
                    style: {
                      fontSize: 20,
                      fontWeight: 400,
                      color: '#e2e8f0',
                      lineHeight: 1.6,
                    },
                    order: 0,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  console.log('✅ Sample stories seeded');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Admin credentials:');
  console.log('   Email: admin@storyflow.com');
  console.log('   Password: Admin@12345');
  console.log('\n⚠️  Change the admin password immediately after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
