"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Story, StoryPage, StoryElement, StoryStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import PagePanel from "./PagePanel";
import EditorCanvas from "./EditorCanvas";
import PropertiesPanel from "./PropertiesPanel";
import EditorTopbar from "./EditorTopbar";
import {
  validateStoryForPublishing,
  hasBlockingErrors,
  ValidationError,
} from "@/lib/stories/validation";

type PageWithElements = StoryPage & { elements: StoryElement[] };

type StoryWithRelations = Story & {
  pages: PageWithElements[];
  tags: { tag: { id: string; name: string } }[];
  author: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
};

export type EditorElement = {
  id: string;
  type: string;
  content: Record<string, unknown>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, unknown>;
  animation: Record<string, unknown>;
  link?: string | null;
  altText?: string | null;
  order: number;
};

export type EditorPage = {
  id: string;
  order: number;
  background: string;
  duration: number;
  elements: EditorElement[];
};

interface Props {
  story: StoryWithRelations;
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  allTags: { id: string; name: string }[];
}

export default function StoryEditorClient({
  story,
  categories,
  authors,
  allTags,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description || "");
  const [coverImage, setCoverImage] = useState(story.coverImage || "");
  const [categoryId, setCategoryId] = useState(story.categoryId || "");
  const [authorId, setAuthorId] = useState(story.authorId || "");
  const [seoTitle, setSeoTitle] = useState(story.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(story.seoDescription || "");
  const [isFeatured, setIsFeatured] = useState(story.isFeatured);
  const [pages, setPages] = useState<EditorPage[]>(
    story.pages.map((p) => ({
      id: p.id,
      order: p.order,
      background: p.background || "#000000",
      duration: p.duration || 7,
      elements: p.elements.map((el) => ({
        id: el.id,
        type: el.type,
        content: el.content as Record<string, unknown>,
        position: el.position as { x: number; y: number },
        size: el.size as { width: number; height: number },
        style: el.style as Record<string, unknown>,
        animation: el.animation as Record<string, unknown>,
        link: el.link,
        altText: el.altText,
        order: el.order,
      })),
    }))
  );

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const dirtyRef = useRef(false);

  const currentPage = pages[selectedPageIndex];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId) || null;

  // Auto-save debounce
  const scheduleAutosave = useCallback(() => {
    dirtyRef.current = true;
    setSaveStatus("unsaved");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimer.current);
  }, []);

  // Warn on unload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        return "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  async function handleSave(isAutosave = false) {
    setSaveStatus("saving");
    try {
      const pagesRes = await Promise.all(
        pages.map(async (page, idx) => {
          // Upsert page
          const pagePayload = {
            order: idx,
            background: page.background,
            duration: page.duration,
          };

          let pageId = page.id;
          if (page.id.startsWith("new_")) {
            // Create new page
            const r = await fetch(`/api/stories/${story.id}/pages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pagePayload),
            });
            const created = await r.json();
            pageId = created.id;
          } else {
            await fetch(`/api/pages/${page.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pagePayload),
            });
          }

          // Upsert elements
          for (const el of page.elements) {
            const elPayload = {
              type: el.type,
              content: el.content,
              position: el.position,
              size: el.size,
              style: el.style,
              animation: el.animation,
              link: el.link,
              altText: el.altText,
              order: el.order,
            };

            if (el.id.startsWith("new_")) {
              await fetch(`/api/pages/${pageId}/elements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(elPayload),
              });
            } else {
              await fetch(`/api/elements/${el.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(elPayload),
              });
            }
          }

          return { ...page, id: pageId };
        })
      );

      // Update story metadata
      await fetch(`/api/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          categoryId,
          authorId,
          seoTitle,
          seoDescription,
          isFeatured,
        }),
      });

      dirtyRef.current = false;
      setSaveStatus("saved");
      if (!isAutosave) {
        toast.success("Story saved successfully");
      }
    } catch {
      setSaveStatus("unsaved");
      toast.error("Failed to save. Please try again.");
    }
  }

  async function handlePublish() {
    setPublishing(true);
    const fakeStory = {
      ...story,
      title,
      description,
      coverImage: coverImage || null,
      authorId,
      categoryId,
      pages: pages.map((p) => ({
        ...p,
        elements: p.elements as unknown as StoryElement[],
      })) as (StoryPage & { elements: StoryElement[] })[],
      author: story.author,
      category: story.category,
    };

    const errors = validateStoryForPublishing(fakeStory as never);
    setValidationErrors(errors);

    if (hasBlockingErrors(errors)) {
      setShowValidation(true);
      setPublishing(false);
      return;
    }

    // Save first
    await handleSave(true);

    const res = await fetch(`/api/stories/${story.id}/publish`, { method: "POST" });
    if (res.ok) {
      toast.success("Story published successfully!");
      router.push(`/admin/stories`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to publish");
    }
    setPublishing(false);
  }

  // Page operations
  function addPage() {
    const newPage: EditorPage = {
      id: `new_${Date.now()}`,
      order: pages.length,
      background: "#1a1a2e",
      duration: 7,
      elements: [],
    };
    setPages([...pages, newPage]);
    setSelectedPageIndex(pages.length);
    scheduleAutosave();
  }

  function duplicatePage(index: number) {
    const page = pages[index];
    const newPage: EditorPage = {
      ...page,
      id: `new_${Date.now()}`,
      order: index + 1,
      elements: page.elements.map((el) => ({
        ...el,
        id: `new_${Date.now()}_${Math.random()}`,
      })),
    };
    const newPages = [
      ...pages.slice(0, index + 1),
      newPage,
      ...pages.slice(index + 1),
    ].map((p, i) => ({ ...p, order: i }));
    setPages(newPages);
    setSelectedPageIndex(index + 1);
    scheduleAutosave();
  }

  function deletePage(index: number) {
    if (pages.length === 1) {
      toast.error("A story must have at least one page");
      return;
    }
    const newPages = pages.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i }));
    setPages(newPages);
    setSelectedPageIndex(Math.min(index, newPages.length - 1));
    scheduleAutosave();
  }

  function movePage(from: number, to: number) {
    const newPages = [...pages];
    const [removed] = newPages.splice(from, 1);
    newPages.splice(to, 0, removed);
    setPages(newPages.map((p, i) => ({ ...p, order: i })));
    setSelectedPageIndex(to);
    scheduleAutosave();
  }

  // Element operations
  function addElement(type: string) {
    if (!currentPage) return;
    const newEl: EditorElement = {
      id: `new_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: { x: 10, y: 30 },
      size: getDefaultSize(type),
      style: getDefaultStyle(type),
      animation: {},
      order: currentPage.elements.length,
    };
    updateCurrentPage({
      elements: [...currentPage.elements, newEl],
    });
    setSelectedElementId(newEl.id);
    scheduleAutosave();
  }

  function updateElement(id: string, updates: Partial<EditorElement>) {
    updateCurrentPage({
      elements: currentPage.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    });
    scheduleAutosave();
  }

  function deleteElement(id: string) {
    updateCurrentPage({
      elements: currentPage.elements.filter((el) => el.id !== id),
    });
    setSelectedElementId(null);
    scheduleAutosave();
  }

  function updateCurrentPage(updates: Partial<EditorPage>) {
    setPages(
      pages.map((p, i) =>
        i === selectedPageIndex ? { ...p, ...updates } : p
      )
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 -m-6 overflow-hidden">
      <EditorTopbar
        title={title}
        onTitleChange={(t) => { setTitle(t); scheduleAutosave(); }}
        saveStatus={saveStatus}
        onSave={() => handleSave(false)}
        onPublish={handlePublish}
        publishing={publishing}
        storyStatus={story.status}
        storySlug={story.slug}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Pages Panel */}
        <PagePanel
          pages={pages}
          selectedIndex={selectedPageIndex}
          onSelect={setSelectedPageIndex}
          onAdd={addPage}
          onDuplicate={duplicatePage}
          onDelete={deletePage}
          onMove={movePage}
        />

        {/* Center — Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          <EditorCanvas
            page={currentPage}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onAddElement={addElement}
            onUpdatePage={(updates) => {
              updateCurrentPage(updates);
              scheduleAutosave();
            }}
          />
        </div>

        {/* Right — Properties Panel */}
        <PropertiesPanel
          story={{ title, description, coverImage, categoryId, authorId, seoTitle, seoDescription, isFeatured }}
          selectedElement={selectedElement}
          categories={categories}
          authors={authors}
          allTags={allTags}
          currentTags={story.tags.map((t) => t.tag)}
          onStoryChange={(updates) => {
            if ("title" in updates) setTitle(updates.title as string);
            if ("description" in updates) setDescription(updates.description as string);
            if ("coverImage" in updates) setCoverImage(updates.coverImage as string);
            if ("categoryId" in updates) setCategoryId(updates.categoryId as string);
            if ("authorId" in updates) setAuthorId(updates.authorId as string);
            if ("seoTitle" in updates) setSeoTitle(updates.seoTitle as string);
            if ("seoDescription" in updates) setSeoDescription(updates.seoDescription as string);
            if ("isFeatured" in updates) setIsFeatured(updates.isFeatured as boolean);
            scheduleAutosave();
          }}
          onElementChange={(updates) => {
            if (selectedElementId) updateElement(selectedElementId, updates);
          }}
          onDeleteElement={() => {
            if (selectedElementId) deleteElement(selectedElementId);
          }}
          currentPage={currentPage}
          onPageChange={(updates) => {
            updateCurrentPage(updates);
            scheduleAutosave();
          }}
        />
      </div>

      {/* Validation errors modal */}
      {showValidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Validation Issues</h2>
            <ul className="space-y-2 mb-6">
              {validationErrors.map((err, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 text-sm px-3 py-2 rounded-lg",
                    err.severity === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  )}
                >
                  <span className="mt-0.5">{err.severity === "error" ? "✗" : "⚠"}</span>
                  <span>{err.message}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidation(false)}
              >
                Fix Issues
              </Button>
              {!hasBlockingErrors(validationErrors) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    setShowValidation(false);
                    await handleSave(true);
                    const res = await fetch(`/api/stories/${story.id}/publish`, { method: "POST" });
                    if (res.ok) {
                      toast.success("Story published!");
                      router.push("/admin/stories");
                    }
                  }}
                  loading={publishing}
                >
                  Publish Anyway
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultContent(type: string): Record<string, unknown> {
  switch (type) {
    case "TEXT": return { text: "Type your text here..." };
    case "IMAGE": return { src: "", fit: "cover" };
    case "VIDEO": return { src: "", poster: "", autoplay: true, loop: true, muted: true };
    case "CTA": return { label: "Learn More", url: "" };
    case "SHAPE": return { shape: "rectangle", filled: true };
    case "BACKGROUND": return { src: "", fit: "cover", color: "#000000" };
    default: return {};
  }
}

function getDefaultSize(type: string): { width: number; height: number } {
  switch (type) {
    case "TEXT": return { width: 80, height: 15 };
    case "IMAGE": return { width: 80, height: 50 };
    case "VIDEO": return { width: 100, height: 60 };
    case "CTA": return { width: 60, height: 8 };
    case "SHAPE": return { width: 40, height: 20 };
    case "BACKGROUND": return { width: 100, height: 100 };
    default: return { width: 50, height: 20 };
  }
}

function getDefaultStyle(type: string): Record<string, unknown> {
  switch (type) {
    case "TEXT":
      return { fontSize: 24, fontWeight: 600, color: "#ffffff", lineHeight: 1.4, textAlign: "left" };
    case "CTA":
      return { backgroundColor: "#ffffff", color: "#000000", borderRadius: 50, padding: "12px 24px" };
    case "SHAPE":
      return { backgroundColor: "#ffffff", opacity: 1, borderRadius: 0 };
    default:
      return {};
  }
}
