import Link from "next/link";
import { Search, Sparkles, Compass, Flame, Clock, PlusCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      take: 10,
      select: { id: true, name: true, slug: true, color: true },
    }).catch(() => []),
  ]);

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all">
      {/* Main Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label={`${settings.site_name} Home`}
          >
            <div className="relative w-8 h-8 rounded-xl story-ring-gradient p-[2px] shadow-sm group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
                {settings.site_name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-0.5">
                Visual Stories
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60"
            aria-label="Main navigation"
          >
            <Link
              href="/stories"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              Explore
            </Link>
            <Link
              href="/trending"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Trending
            </Link>
            <Link
              href="/latest"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Latest
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors border border-slate-200/80"
              aria-label="Search stories"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Search stories...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-600 rounded border border-slate-200">
                /
              </kbd>
            </Link>

            {/* Admin / Creator Hub */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-600 hover:to-indigo-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Studio</span>
            </Link>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <MobileMenu categories={categories} />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Strip */}
      <div className="border-t border-slate-200/50 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-2 overflow-x-auto hide-scrollbar">
            <Link
              href="/stories"
              className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full bg-slate-900 text-white shadow-sm hover:bg-blue-600 transition-colors"
            >
              All Topics
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color || "#3b82f6" }}
                />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
