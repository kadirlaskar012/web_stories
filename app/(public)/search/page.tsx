import { Suspense } from "react";
import type { Metadata } from "next";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search Stories",
  description: "Search through all our published Web Stories by title, category, author, or topic.",
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const page = Math.max(1, Number(params.page) || 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Stories</h1>

      {/* Search form */}
      <form method="GET" action="/search" className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search stories, topics, authors..."
            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            autoFocus
            aria-label="Search stories"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label="Submit search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      <Suspense fallback={<p className="text-gray-500 text-sm">Searching...</p>}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </div>
  );
}
