import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const uploadedById = session?.userId || null;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
    ];

    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WebP, GIF, MP4, WebM.` },
        { status: 400 }
      );
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl: string;
    let thumbnailUrl: string | undefined;
    let cloudinaryId: string | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary CDN
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

      publicUrl = uploadResult.secure_url;
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
      // Local fallback
      const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
      const hash = crypto.randomBytes(8).toString("hex");
      const filename = `${Date.now()}-${hash}${ext}`;

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);

      publicUrl = `/uploads/${filename}`;
      thumbnailUrl = `/uploads/${filename}`;
    }

    const safeFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");

    // Save to Database
    const media = await prisma.media.create({
      data: {
        filename: safeFilename,
        originalName: file.name,
        url: publicUrl,
        thumbnailUrl: thumbnailUrl || publicUrl,
        width,
        height,
        fileSize: file.size,
        mimeType: file.type,
        cloudinaryId,
        format,
        uploadedById,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
