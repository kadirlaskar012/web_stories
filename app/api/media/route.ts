import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Configure Cloudinary if available
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const uploadedById = session?.userId || null;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}. Allowed: JPG, PNG, WebP, GIF, MP4, WebM.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string;
    let thumbnailUrl: string | undefined;
    let cloudinaryId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;

    if (isCloudinaryConfigured()) {
      // 1. Upload to Cloudinary
      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: file.type.startsWith("video") ? "video" : "image",
              folder: "webstories",
              transformation: file.type.startsWith("image")
                ? [{ quality: "auto", fetch_format: "auto" }]
                : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!);
            }
          )
          .end(buffer);
      });

      url = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
      width = uploadResult.width;
      height = uploadResult.height;
      format = uploadResult.format;

      if (!file.type.startsWith("video")) {
        thumbnailUrl = cloudinary.url(cloudinaryId, {
          width: 400,
          height: 400,
          crop: "fill",
          quality: "auto",
          fetch_format: "webp",
          secure: true,
        });
      }
    } else {
      // 2. Automatic Local Storage (/public/uploads)
      const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
      const hash = crypto.randomBytes(8).toString("hex");
      const filename = `${Date.now()}-${hash}${ext}`;

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);

      url = `/uploads/${filename}`;
      thumbnailUrl = `/uploads/${filename}`;
    }

    // Safe filename
    const safeFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");

    // Save metadata in Database
    const media = await prisma.media.create({
      data: {
        filename: safeFilename,
        originalName: file.name,
        url,
        thumbnailUrl,
        width,
        height,
        fileSize: file.size,
        mimeType: file.type,
        altText: altText || null,
        cloudinaryId,
        format,
        uploadedById,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (err: any) {
    console.error("[MEDIA_UPLOAD]", err);
    return NextResponse.json(
      { error: err.message || "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const limit = 24;

  const where = {
    ...(search && { filename: { contains: search } }),
    ...(type === "image" && { mimeType: { startsWith: "image/" } }),
    ...(type === "video" && { mimeType: { startsWith: "video/" } }),
  };

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({ media, total, pages: Math.ceil(total / limit) });
}
