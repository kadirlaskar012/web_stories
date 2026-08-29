"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Compass, Flame, Clock, Search, PlusCircle, Sparkles } from "lucide-react";

interface MobileMenuProps {
  navLinks?: { href: string; label: string }[];
  categories: { name: string; slug: string; color: string | null }[];
}

const defaultNavLinks = [
  { href: "/stories", label: "Explore Library", icon: Compass },
  { href: "/trending", label: "Trending Leaderboard", icon: Flame },
  { href: "/latest", label: "Latest Drops", icon: Clock },
];

export default function MobileMenu({
  navLinks = defaultNavLinks,
  categories,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg story-ring-gradient p-[1.5px]">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>
              <span className="font-bold text-base text-white">StoryFlow</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = (link as any).icon || Compass;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800 px-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Explore Topics
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || "#3b82f6" }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-800 space-y-2">
          <Link
            href="/admin"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Creator Studio</span>
          </Link>
          <div className="flex justify-between text-xs text-slate-400 pt-2 px-1">
            <Link href="/about" onClick={() => setOpen(false)} className="hover:text-white">About</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-white">Contact</Link>
            <Link href="/privacy" onClick={() => setOpen(false)} className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </div>
    </>
  );
}
