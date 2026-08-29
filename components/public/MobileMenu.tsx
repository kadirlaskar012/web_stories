"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileMenuProps {
  navLinks: { href: string; label: string }[];
  categories: { name: string; slug: string; color: string | null }[];
}

export default function MobileMenu({ navLinks, categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-4 px-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setOpen(false)}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                />
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="mt-4 px-5 pt-4 border-t border-gray-100">
            <Link
              href="/search"
              className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              Search Stories
            </Link>
            <Link
              href="/about"
              className="block mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
