import Link from "next/link";
import Image from "next/image";
import { Story, Author, Category } from "@prisma/client";
import { Eye, Play, Sparkles } from "lucide-react";

type StoryWithRelations = Story & {
  author: Pick<Author, "name" | "slug"> & { avatar?: string | null };
  category: Pick<Category, "name" | "slug" | "color">;
  _count?: { pages: number };
};

interface StoryCardProps {
  story: StoryWithRelations;
  priority?: boolean;
  rank?: number;
  featured?: boolean;
}

export function StoryCard({ story, priority = false, rank, featured = false }: StoryCardProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group block relative select-none"
      aria-label={`Read story: ${story.title}`}
    >
      <div className="story-card-premium relative bg-slate-900 overflow-hidden shadow-lg group-hover:shadow-2xl">
        {/* Cover Image */}
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-cover"
            priority={priority}
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-indigo-950 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white/30" />
          </div>
        )}

        {/* Cinematic Gradient Overlay */}
        <div className="story-card-overlay-gradient" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Category Pill */}
          <span
            className="text-[11px] font-bold text-white tracking-wide uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-md"
            style={{ backgroundColor: `${story.category.color || "#3b82f6"}ee` }}
          >
            {story.category.name}
          </span>

          {/* Rank Badge or Play Indicator */}
          {rank !== undefined ? (
            <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-black text-xs flex items-center justify-center border border-amber-400/40 shadow-lg">
              #{rank}
            </span>
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-200">
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Bottom Editorial Content */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col justify-end">
          {/* Title */}
          <h3 className="text-white font-extrabold text-sm sm:text-base leading-snug line-clamp-3 mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:text-sky-300 transition-colors">
            {story.title}
          </h3>

          {/* Author & Views Footer */}
          <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <div className="w-4 h-4 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                {story.author.avatar ? (
                  <Image src={story.author.avatar} alt={story.author.name} width={16} height={16} className="w-full h-full object-cover" />
                ) : (
                  story.author.name[0]?.toUpperCase()
                )}
              </div>
              <span className="truncate font-medium text-[11px] text-white/90">{story.author.name}</span>
            </div>

            {story.viewCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-white/75 font-semibold flex-shrink-0">
                <Eye className="w-3 h-3 text-white/70" />
                {story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}k` : story.viewCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Horizontal card for searches and lists
export function StoryListCard({ story, priority = false }: StoryCardProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className="group flex gap-4 items-center bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all"
      aria-label={`Read story: ${story.title}`}
    >
      <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            quality={80}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="flex-1 min-w-0 py-1">
        <span
          className="inline-block text-[10px] font-bold text-white uppercase px-2 py-0.5 rounded-full mb-1.5"
          style={{ backgroundColor: story.category.color || "#3b82f6" }}
        >
          {story.category.name}
        </span>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {story.title}
        </h4>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
          <span>By {story.author.name}</span>
          {story.viewCount > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Eye className="w-3 h-3 text-slate-400" /> {story.viewCount.toLocaleString()}
              </span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
