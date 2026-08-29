import { prisma } from "@/lib/db";
import { StoryWizard } from "@/components/admin/StoryWizard";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }).catch(() => []),
    prisma.author.findMany({
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      {categories.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 text-sm">
          You need to{" "}
          <a href="/admin/categories" className="font-bold underline">
            create at least one category
          </a>{" "}
          before creating a story.
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 text-sm">
          You need to{" "}
          <a href="/admin/authors" className="font-bold underline">
            create at least one author
          </a>{" "}
          before creating a story.
        </div>
      ) : (
        <StoryWizard categories={categories} authors={authors} />
      )}
    </div>
  );
}
