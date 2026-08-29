import { prisma } from "@/lib/db";
import TagListClient from "./TagListClient";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stories: true } },
    },
  });

  return <TagListClient initialTags={tags} />;
}
