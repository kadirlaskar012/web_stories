/**
 * Client-Side Smart Image Compressor
 * Resizes and compresses local images before uploading to Cloudinary
 * Targets 1080x1920 9:16 Web Story resolution at ~0.85 WebP quality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // If not an image (e.g. video), return original file
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const {
    maxWidth = 1080,
    maxHeight = 1920,
    quality = 0.85,
    outputFormat = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect-ratio preserving dimensions
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file); // fallback to original
            return;
          }

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Create new compressed File object
              const ext = outputFormat === "image/webp" ? ".webp" : ".jpg";
              const cleanName = file.name.replace(/\.[^/.]+$/, "") + ext;
              const compressedFile = new File([blob], cleanName, {
                type: outputFormat,
                lastModified: Date.now(),
              });

              console.log(
                `⚡ Compressed "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)}MB) → "${cleanName}" (${(compressedFile.size / 1024).toFixed(1)}KB)`
              );

              resolve(compressedFile);
            },
            outputFormat,
            quality
          );
        } catch (err) {
          console.warn("Canvas compression failed, using original file:", err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
