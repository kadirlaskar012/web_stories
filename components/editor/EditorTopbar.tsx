"use client";
import { Save, Globe, Eye, ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { StoryStatus } from "@prisma/client";

interface Props {
  title: string;
  onTitleChange: (t: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  onSave: () => void;
  onPublish: () => void;
  publishing: boolean;
  storyStatus: StoryStatus;
  storySlug: string;
}

export default function EditorTopbar({
  title,
  onTitleChange,
  saveStatus,
  onSave,
  onPublish,
  publishing,
  storyStatus,
  storySlug,
}: Props) {
  const saveIcons = {
    saved: <CheckCircle className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />,
    saving: <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" aria-hidden="true" />,
    unsaved: <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />,
  };

  const saveLabels = {
    saved: "Saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 flex-shrink-0 z-10">
      <Link
        href="/admin/stories"
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Back to stories"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </Link>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 min-w-0"
        placeholder="Story title..."
        aria-label="Story title"
      />

      {/* Save status */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
        {saveIcons[saveStatus]}
        <span className="hidden sm:block">{saveLabels[saveStatus]}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {storyStatus === StoryStatus.PUBLISHED && (
          <a
            href={`/story/${storySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View
          </a>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="hidden sm:flex"
        >
          <Save className="w-3.5 h-3.5" aria-hidden="true" />
          Save
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onPublish}
          loading={publishing}
        >
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          {storyStatus === StoryStatus.PUBLISHED ? "Update" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
