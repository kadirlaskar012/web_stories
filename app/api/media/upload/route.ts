import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // Allow upload if authenticated or in dev mode
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

    // Max 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 25MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
    const hash = crypto.randomBytes(12).toString("hex");
    const filename = `${Date.now()}-${hash}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Save to Database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url: publicUrl,
        mimeType: file.type,
        fileSize: file.size,
        uploadedById,
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media,
    });
  } catch (error: any) {
    console.error("Local file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
