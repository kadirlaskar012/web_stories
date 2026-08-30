import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Extract Cloudinary public_id from a URL
function extractCloudinaryPublicId(url: string): string | null {
  try {
    if (!url.includes("res.cloudinary.com")) return null;
    // URL pattern: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<ext>
    // or: https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>.<ext>
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    console.error("Failed to extract Cloudinary publicId:", e);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, id, publicId } = body;

    if (!url && !id && !publicId) {
      return NextResponse.json({ error: "No media identifier provided" }, { status: 400 });
    }

    let resolvedPublicId = publicId || (url ? extractCloudinaryPublicId(url) : null);
    let mediaRecord = null;

    if (id) {
      mediaRecord = await prisma.media.findUnique({ where: { id } });
      if (mediaRecord?.cloudinaryId) {
        resolvedPublicId = mediaRecord.cloudinaryId;
      }
    } else if (url) {
      mediaRecord = await prisma.media.findFirst({ where: { url } });
      if (mediaRecord?.cloudinaryId) {
        resolvedPublicId = mediaRecord.cloudinaryId;
      }
    }

    // 1. Delete from Cloudinary if configured & publicId is known
    if (resolvedPublicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(resolvedPublicId);
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
      }
    }

    // 2. Delete local fallback file if it starts with /uploads/
    if (url && url.startsWith("/uploads/")) {
      try {
        const localPath = path.join(process.cwd(), "public", url);
        await unlink(localPath).catch(() => {});
      } catch (localErr) {
        console.error("Local file delete error:", localErr);
      }
    }

    // 3. Delete from DB if record exists
    if (mediaRecord) {
      await prisma.media.delete({ where: { id: mediaRecord.id } }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete media API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
