import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning all dummy stories, pages, elements, tags, categories, and authors...");

  // 1. Delete all dependent story data
  await prisma.analyticsEvent.deleteMany({});
  await prisma.revision.deleteMany({});
  await prisma.storyTag.deleteMany({});
  await prisma.storyElement.deleteMany({});
  await prisma.storyPage.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.author.deleteMany({});

  console.log("✅ All dummy stories, categories, and authors deleted!");

  // 2. Ensure 1 single Admin User exists
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@storypulse.com" },
    update: {
      name: "StoryPulse Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@storypulse.com",
      name: "StoryPulse Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Also keep admin@storyflow.com updated if needed
  await prisma.user.updateMany({
    where: { email: "admin@storyflow.com" },
    data: { email: "admin@storypulse.com", name: "StoryPulse Admin" },
  }).catch(() => {});

  // 3. Create 1 Single Official Brand Author
  const defaultAuthor = await prisma.author.create({
    data: {
      name: "StoryPulse Editorial",
      slug: "storypulse",
      bio: "Official visual journalism and editorial team bringing you immersive, verified 9:16 Web Stories.",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
      email: "editorial@storypulse.com",
      website: "https://storypulse.com",
      userId: adminUser.id,
    },
  });

  // 4. Update Site Settings
  const settings = [
    { key: "site_name", value: "StoryPulse" },
    { key: "site_description", value: "Discover immersive 9:16 visual Web Stories across breaking news, lifestyle, tech, and culture." },
    { key: "publisher_name", value: "StoryPulse Media" },
    { key: "default_seo_title", value: "StoryPulse — Visual Web Stories Network" },
    { key: "default_seo_description", value: "Discover immersive 9:16 visual Web Stories across breaking news, lifestyle, tech, and culture." },
    { key: "contact_email", value: "contact@storypulse.com" },
    { key: "footer_text", value: "© 2026 StoryPulse Media. All rights reserved." },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("🎉 Database cleaned and reset successfully!");
  console.log(`Single Author Created: ${defaultAuthor.name} (${defaultAuthor.slug})`);
  console.log(`Admin Login: admin@storypulse.com (Password: Admin@12345)`);
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
