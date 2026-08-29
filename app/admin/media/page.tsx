import { prisma } from "@/lib/db";
import MediaManagerClient from "./MediaManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  return (
    <MediaManagerClient
      initialMedia={media}
      cloudinaryConfigured={cloudinaryConfigured}
    />
  );
}
