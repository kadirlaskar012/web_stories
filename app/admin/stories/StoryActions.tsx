"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MoreVertical, Archive, Eye, CheckCircle } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { StoryStatus } from "@prisma/client";

interface Story {
  id: string;
  title: string;
  status: StoryStatus;
}

export default function StoryActions({ story }: { story: Story }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    setShowMenu(false);
    try {
      const res = await fetch(`/api/stories/${story.id}/${action}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === "delete"
          ? "Story deleted"
          : action === "publish"
          ? "Story published"
          : action === "unpublish"
          ? "Story unpublished"
          : action === "archive"
          ? "Story archived"
          : "Done"
      );
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="More actions"
          aria-haspopup="true"
          aria-expanded={showMenu}
          disabled={loading}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
              {story.status !== StoryStatus.PUBLISHED && (
                <button
                  onClick={() => handleAction("publish")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish
                </button>
              )}
              {story.status === StoryStatus.PUBLISHED && (
                <button
                  onClick={() => handleAction("unpublish")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Unpublish
                </button>
              )}
              {story.status !== StoryStatus.ARCHIVED && (
                <button
                  onClick={() => handleAction("archive")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  setConfirmDelete(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => handleAction("delete")}
        title="Delete Story"
        message={`Are you sure you want to delete "${story.title}"? This action cannot be undone.`}
        confirmLabel="Delete Story"
        confirmVariant="danger"
        loading={loading}
      />
    </>
  );
}
