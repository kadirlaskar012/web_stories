import Link from "next/link";
import Image from "next/image";
import { Story, Author, Category } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";

type StoryWithRelations = Story & {
  author: Pick<Author, "name" | "slug">;
  category: Pick<Category, "name" | "slug" | "color">;
};

interface StoryCardProps {
  story: StoryWithRelations;
  priority?: boolean;
}

export function StoryCard({ story, priority = false }: StoryCardProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="story-card group block"
      aria-label={`Read story: ${story.title}`}
    >
      <div className="story-card aspect-[9/16] relative bg-gray-100 rounded-xl overflow-hidden">
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📖</span>
          </div>
        )}

        {/* Overlay */}
        <div className="story-card-overlay absolute inset-0" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          {/* Category */}
          <span
            className="inline-block text-xs font-semibold text-white mb-2 px-2 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: story.category.color || "#6366f1" }}
          >
            {story.category.name}
          </span>

          {/* Title */}
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-3 mb-2">
            {story.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <span>{story.author.name}</span>
            {story.viewCount > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" aria-hidden="true" />
                  {story.viewCount.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Horizontal card for lists/search results
export function StoryListCard({ story, priority = false }: StoryCardProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group flex gap-4 items-start"
      aria-label={`Read story: ${story.title}`}
    >
      <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            quality={80}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <span
          className="text-xs font-medium"
          style={{ color: story.category.color || "#6366f1" }}
        >
          {story.category.name}
        </span>
        <h3 className="mt-0.5 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {story.title}
        </h3>
        {story.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {story.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span>{story.author.name}</span>
          {story.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={story.publishedAt.toISOString()}>
                {formatDate(story.publishedAt)}
              </time>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
