import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      take: 8,
      select: { name: true, slug: true, color: true },
    }).catch(() => []),
  ]);

  const navLinks = [
    { href: "/stories", label: "Stories" },
    { href: "/trending", label: "Trending" },
    { href: "/latest", label: "Latest" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-gray-900 flex-shrink-0"
            aria-label={`${settings.site_name} home`}
          >
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.site_name}
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            ) : (
              <span className="tracking-tight">{settings.site_name}</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Categories dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                Categories
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || "#6366f1" }}
                    />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Link>

            <MobileMenu navLinks={navLinks} categories={categories} />
          </div>
        </div>

        {/* Category strip (desktop) */}
        {categories.length > 0 && (
          <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex-shrink-0 px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
