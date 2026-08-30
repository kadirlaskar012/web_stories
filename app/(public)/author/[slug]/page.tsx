import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { StoryCard } from "@/components/story/StoryCard";
import { getSiteSettings } from "@/lib/settings";
import { generateAuthorMetadata } from "@/lib/seo/metadata";
import { StoryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { Globe, BookOpen } from "lucide-react";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const authors = await prisma.author.findMany({
      select: { slug: true },
    });
    return authors.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const [author, settings] = await Promise.all([
      prisma.author.findUnique({ where: { slug } }).catch(() => null),
      getSiteSettings(),
    ]);
    if (!author) return { title: "Author Profile" };
    return generateAuthorMetadata(author, settings);
  } catch {
    return { title: "Author Profile" };
  }
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;

  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      _count: { select: { stories: { where: { status: StoryStatus.PUBLISHED } } } },
    },
  }).catch(() => null);

  if (!author) notFound();

  const stories = await prisma.story.findMany({
    where: { authorId: author.id, status: StoryStatus.PUBLISHED },
    include: {
      author: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, color: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 18,
  }).catch(() => []);

  const socialLinks = [
    { href: author.website, icon: Globe, label: "Website" },
    { href: author.twitter, icon: TwitterIcon, label: "Twitter" },
    { href: author.instagram, icon: InstagramIcon, label: "Instagram" },
    { href: author.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  ].filter((l) => l.href);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Author profile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-8 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-2xl font-bold">
              {author.name[0]}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
          {author.bio && (
            <p className="mt-1 text-gray-600 max-w-xl leading-relaxed">{author.bio}</p>
          )}
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>{author._count.stories} stories</span>
            </div>
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stories */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Stories by {author.name}
      </h2>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} priority={i < 6} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No published stories yet.</p>
      )}
    </div>
  );
}
