"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { formatFileSize } from "@/lib/utils";
import { Upload, Trash2, Copy, Image as ImageIcon, Video, Search, Check } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string;
  altText: string | null;
  createdAt: string | Date;
}

export default function MediaManagerClient({
  initialMedia,
  cloudinaryConfigured,
}: {
  initialMedia: MediaItem[];
  cloudinaryConfigured: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(search.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" ? true :
      typeFilter === "image" ? item.mimeType.startsWith("image/") :
      item.mimeType.startsWith("video/");
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("File uploaded successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/media/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media");
      toast.success("Media deleted");
      setDeleteTarget(null);
      if (selectedMedia?.id === deleteTarget.id) setSelectedMedia(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete media");
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage visual assets for your stories</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            variant="secondary"
            size="md"
          >
            <Upload className="w-4 h-4" /> Upload Media
          </Button>
        </div>
      </div>

      {!cloudinaryConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold">Cloudinary Storage Notice</p>
          <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
            To enable cloud file uploads, configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_KEY</code>, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_SECRET</code> in your environment. You can still use external image URLs directly in the Story Editor.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media files..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {["all", "image", "video"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                typeFilter === type
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedMedia(item)}
            className={`group relative rounded-xl overflow-hidden border bg-white cursor-pointer transition-all hover:shadow-md ${
              selectedMedia?.id === item.id ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"
            }`}
          >
            <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
              {item.mimeType.startsWith("image/") ? (
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.altText || item.filename}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Video className="w-8 h-8" />
                  <span className="text-[10px] uppercase font-semibold">Video</span>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.url, item.id);
                  }}
                  className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 shadow"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(item);
                  }}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-gray-900 truncate" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{formatFileSize(item.fileSize)}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No media found</p>
          <p className="text-xs text-gray-500 mt-1">Upload images or videos to build your asset library</p>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Media File"
        message={`Are you sure you want to delete "${deleteTarget?.filename}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
