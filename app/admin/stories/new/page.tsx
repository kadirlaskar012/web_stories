import { prisma } from "@/lib/db";
import NewStoryForm from "./NewStoryForm";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Story</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new story and open it in the editor.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          You need to{" "}
          <a href="/admin/categories" className="font-medium underline">
            create at least one category
          </a>{" "}
          before creating a story.
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          You need to{" "}
          <a href="/admin/authors" className="font-medium underline">
            create at least one author
          </a>{" "}
          before creating a story.
        </div>
      ) : (
        <NewStoryForm categories={categories} authors={authors} />
      )}
    </div>
  );
}
