import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our mission, our storytellers, and our visual web story publishing platform.",
};

export default async function AboutPage() {
  const [settings, authorsCount, storiesCount] = await Promise.all([
    getSiteSettings(),
    prisma.author.count().catch(() => 0),
    prisma.story.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">About Us</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Redefining visual storytelling on the open web
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {settings.site_description}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-16 text-center">
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-3xl font-extrabold text-gray-900">{storiesCount}+</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Stories Published</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-3xl font-extrabold text-gray-900">{authorsCount}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Contributing Creators</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-3xl font-extrabold text-gray-900">100%</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Mobile & SEO Optimized</p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900">Our Vision</h2>
        <p>
          We believe that mobile content consumption demands rich, immersive, and lightning-fast visual experiences. Web Stories provide a tap-through, full-screen format that empowers creators, journalists, and educators to share compelling visual narratives with global audiences without gatekeepers.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Engineered for Performance & Discoverability</h2>
        <p>
          Every story is generated with high-performance responsive media delivery, strict semantic structured data schema, automated XML sitemaps, and seamless tap navigation.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Explore All Stories
        </Link>
      </div>
    </div>
  );
}
