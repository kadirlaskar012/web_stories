"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoryStatus } from "@prisma/client";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";
import {
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  CheckCircle,
  Archive,
  Copy,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

export interface StoryListItem {
  id: string;
  title: string;
  slug: string;
  status: StoryStatus;
  isFeatured: boolean;
  updatedAt: string | Date;
  author: { name: string };
  category: { name: string; color: string | null };
}

interface Props {
  stories: StoryListItem[];
}

export function StoriesTableClient({ stories }: Props) {
  const router = useRouter();

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [singleDeleteStory, setSingleDeleteStory] = useState<{ id: string; title: string } | null>(null);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Checkbox helpers
  const isAllSelected = stories.length > 0 && selectedIds.length === stories.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < stories.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stories.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Action Handler
  const handleSingleAction = async (storyId: string, action: string) => {
    setLoading(true);
    setActiveMenuId(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === "delete"
          ? "Story deleted"
          : action === "publish"
          ? "Story published"
          : action === "unpublish"
          ? "Story moved to draft"
          : action === "archive"
          ? "Story archived"
          : "Action completed"
      );
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
      setSingleDeleteStory(null);
    }
  };

  // Bulk Action Handler
  const handleBulkAction = async (action: "publish" | "draft" | "archive" | "delete") => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stories/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyIds: selectedIds,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk action failed");

      toast.success(data.message || "Bulk action completed!");
      setSelectedIds([]);
      setBulkDeleteModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Bulk action failed");
    } finally {
      setLoading(false);
    }
  };

  // Copy Link Helper
  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/story/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Story link copied to clipboard!");
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-visible">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-visible">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                {/* Select All Checkbox */}
                <th className="w-12 px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                    title={isAllSelected ? "Deselect All" : "Select All"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5">Headline</th>
                <th className="text-left px-4 py-3.5">Reporter</th>
                <th className="text-left px-4 py-3.5">Category</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated</th>
                <th className="text-right px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stories.length > 0 ? (
                stories.map((story) => {
                  const isSelected = selectedIds.includes(story.id);
                  const isMenuOpen = activeMenuId === story.id;

                  return (
                    <tr
                      key={story.id}
                      className={`transition-colors ${
                        isSelected ? "bg-red-50/40" : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(story.id)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Headline */}
                      <td className="px-4 py-3.5">
                        <div>
                          <Link
                            href={`/admin/stories/${story.id}/edit`}
                            className="font-extrabold text-slate-900 hover:text-red-600 transition-colors line-clamp-1 max-w-sm"
                          >
                            {story.title}
                          </Link>
                          {story.isFeatured && (
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block mt-0.5">
                              ★ Featured Banner
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                        {story.author?.name || "Editorial"}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: story.category?.color || "#dc2626" }}
                        >
                          {story.category?.name || "News"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={story.status} />
                      </td>

                      {/* Updated Date */}
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formatDateShort(story.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Link */}
                          <Link
                            href={`/admin/stories/${story.id}/edit`}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Story"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* View Live Story */}
                          {story.status === StoryStatus.PUBLISHED && (
                            <a
                              href={`/story/${story.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="View Public Story"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}

                          {/* 3-Dots Menu Trigger */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : story.id);
                              }}
                              className={`p-1.5 rounded-xl transition-colors ${
                                isMenuOpen
                                  ? "bg-slate-900 text-white shadow"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                              aria-label="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* 3-Dots Dropdown Menu */}
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 py-1.5 text-xs animate-fade-in divide-y divide-slate-100">
                                  <div className="py-1">
                                    {story.status !== StoryStatus.PUBLISHED ? (
                                      <button
                                        type="button"
                                        onClick={() => handleSingleAction(story.id, "publish")}
                                        className="w-full flex items-center gap-2 px-3.5 py-2 font-bold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Publish Story</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSingleAction(story.id, "unpublish")}
                                        className="w-full flex items-center gap-2 px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                      >
                                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Move to Draft</span>
                                      </button>
                                    )}

                                    {story.status !== StoryStatus.ARCHIVED && (
                                      <button
                                        type="button"
                                        onClick={() => handleSingleAction(story.id, "archive")}
                                        className="w-full flex items-center gap-2 px-3.5 py-2 font-bold text-amber-700 hover:bg-amber-50 transition-colors text-left"
                                      >
                                        <Archive className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Archive Story</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyLink(story.slug)}
                                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Copy Public Link</span>
                                    </button>
                                  </div>

                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setSingleDeleteStory({ id: story.id, title: story.title });
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2 font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Story</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">
                    No stories found.{" "}
                    <Link href="/admin/stories/new" className="text-red-600 font-bold hover:underline">
                      Create your first story
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {stories.length > 0 ? (
            stories.map((story) => {
              const isSelected = selectedIds.includes(story.id);

              return (
                <div
                  key={story.id}
                  className={`p-4 space-y-2.5 transition-colors ${
                    isSelected ? "bg-red-50/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(story.id)}
                        className="p-1 rounded text-slate-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-red-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black text-white"
                        style={{ backgroundColor: story.category?.color || "#dc2626" }}
                      >
                        {story.category?.name}
                      </span>
                    </div>
                    <StatusBadge status={story.status} />
                  </div>

                  <Link
                    href={`/admin/stories/${story.id}/edit`}
                    className="font-extrabold text-sm text-slate-900 block hover:text-red-600 transition-colors"
                  >
                    {story.title}
                  </Link>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span>By {story.author?.name}</span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/stories/${story.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-slate-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      {story.status === StoryStatus.PUBLISHED && (
                        <a
                          href={`/story/${story.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSingleDeleteStory({ id: story.id, title: story.title })}
                        className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No stories found.
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY / FLOATING BULK ACTIONS TOOLBAR (When stories are selected)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-in">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Selected
            </span>
          </div>

          {/* Bulk Publish */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleBulkAction("publish")}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          {/* Bulk Draft */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleBulkAction("draft")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-600"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Draft</span>
          </button>

          {/* Bulk Archive */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleBulkAction("archive")}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>

          {/* Bulk Delete */}
          <button
            type="button"
            disabled={loading}
            onClick={() => setBulkDeleteModal(true)}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Deselect All */}
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white underline pl-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Single Story Delete Modal */}
      {singleDeleteStory && (
        <ConfirmModal
          open={!!singleDeleteStory}
          onClose={() => setSingleDeleteStory(null)}
          onConfirm={() => handleSingleAction(singleDeleteStory.id, "delete")}
          title="Delete Story"
          message={`Are you sure you want to delete "${singleDeleteStory.title}"? This will remove all slides and cannot be undone.`}
          confirmLabel="Delete Permanently"
          confirmVariant="danger"
          loading={loading}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal && (
        <ConfirmModal
          open={bulkDeleteModal}
          onClose={() => setBulkDeleteModal(false)}
          onConfirm={() => handleBulkAction("delete")}
          title={`Delete ${selectedIds.length} Selected Stories`}
          message={`Are you sure you want to permanently delete these ${selectedIds.length} stories? All associated slides and media will be wiped.`}
          confirmLabel={`Delete ${selectedIds.length} Stories`}
          confirmVariant="danger"
          loading={loading}
        />
      )}
    </div>
  );
}
