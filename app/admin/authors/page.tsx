import { prisma } from "@/lib/db";
import AuthorListClient from "./AuthorListClient";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  return <AuthorListClient initialAuthors={authors} />;
}
