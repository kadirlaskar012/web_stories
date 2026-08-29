import { prisma } from "@/lib/db";
import CategoryListClient from "./CategoryListClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  return <CategoryListClient initialCategories={categories} />;
}
