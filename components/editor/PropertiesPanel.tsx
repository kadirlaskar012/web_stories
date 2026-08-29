"use client";
import { useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/FormFields";
import type { EditorPage, EditorElement } from "./StoryEditorClient";
import { cn } from "@/lib/utils";

interface StoryMeta {
  title: string;
  description: string;
  coverImage: string;
  categoryId: string;
  authorId: string;
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
}

interface Props {
  story: StoryMeta;
  selectedElement: EditorElement | null;
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  allTags: { id: string; name: string }[];
  currentTags: { id: string; name: string }[];
  currentPage: EditorPage | undefined;
  onStoryChange: (updates: Partial<StoryMeta>) => void;
  onElementChange: (updates: Partial<EditorElement>) => void;
  onDeleteElement: () => void;
  onPageChange: (updates: Partial<EditorPage>) => void;
}

type PanelTab = "story" | "page" | "element";

export default function PropertiesPanel({
  story,
  selectedElement,
  categories,
  authors,
  allTags,
  currentTags,
  currentPage,
  onStoryChange,
  onElementChange,
  onDeleteElement,
  onPageChange,
}: Props) {
  const [tab, setTab] = useState<PanelTab>(selectedElement ? "element" : "story");

  // Auto-switch to element tab when element is selected
  if (selectedElement && tab !== "element") {
    setTab("element");
  }

  const tabs: { id: PanelTab; label: string }[] = [
    { id: "story", label: "Story" },
    { id: "page", label: "Page" },
    { id: "element", label: selectedElement ? "Element" : "Element" },
  ];

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
              tab === t.id
                ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Story Tab */}
        {tab === "story" && (
          <>
            <Input
              label="Title"
              value={story.title}
              onChange={(e) => onStoryChange({ title: e.target.value })}
              placeholder="Story title"
            />
            <Textarea
              label="Description"
              value={story.description}
              onChange={(e) => onStoryChange({ description: e.target.value })}
              placeholder="Brief description"
              rows={3}
            />
            <Input
              label="Cover Image URL"
              value={story.coverImage}
              onChange={(e) => onStoryChange({ coverImage: e.target.value })}
              placeholder="https://..."
              type="url"
            />
            <Select
              label="Category"
              value={story.categoryId}
              onChange={(e) => onStoryChange({ categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
            />
            <Select
              label="Author"
              value={story.authorId}
              onChange={(e) => onStoryChange({ authorId: e.target.value })}
              options={authors.map((a) => ({ value: a.id, label: a.name }))}
              placeholder="Select author"
            />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                SEO
              </p>
              <Input
                label="SEO Title"
                value={story.seoTitle}
                onChange={(e) => onStoryChange({ seoTitle: e.target.value })}
                placeholder="Search engine title"
                hint={`${story.seoTitle.length}/60 chars`}
              />
              <Textarea
                label="SEO Description"
                value={story.seoDescription}
                onChange={(e) => onStoryChange({ seoDescription: e.target.value })}
                placeholder="Search engine description"
                rows={2}
                hint={`${story.seoDescription.length}/160 chars`}
                className="mt-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={story.isFeatured}
                onChange={(e) => onStoryChange({ isFeatured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Featured Story
              </label>
            </div>
          </>
        )}

        {/* Page Tab */}
        {tab === "page" && currentPage && (
          <>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentPage.background || "#000000"}
                  onChange={(e) => onPageChange({ background: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  aria-label="Background color"
                />
                <Input
                  value={currentPage.background || "#000000"}
                  onChange={(e) => onPageChange({ background: e.target.value })}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Page Duration (seconds)
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={currentPage.duration || 7}
                onChange={(e) => onPageChange({ duration: Number(e.target.value) })}
                className="w-full"
                aria-label="Page duration"
              />
              <p className="text-xs text-gray-500 text-right">
                {currentPage.duration || 7}s
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Background Image</p>
              <Input
                value={(currentPage.elements.find((el) => el.type === "BACKGROUND")?.content as { src?: string })?.src || ""}
                onChange={(e) => {
                  const bgEl = currentPage.elements.find((el) => el.type === "BACKGROUND");
                  if (bgEl) {
                    // onElementChange won't work here as it targets selected; use page update
                    onPageChange({
                      elements: currentPage.elements.map((el) =>
                        el.type === "BACKGROUND"
                          ? { ...el, content: { ...el.content, src: e.target.value } }
                          : el
                      ),
                    });
                  }
                }}
                placeholder="https://... background image URL"
                type="url"
              />
            </div>
          </>
        )}

        {/* Element Tab */}
        {tab === "element" && (
          <>
            {selectedElement ? (
              <ElementProperties
                el={selectedElement}
                onChange={onElementChange}
                onDelete={onDeleteElement}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">
                  Select an element on the canvas to edit its properties.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function ElementProperties({
  el,
  onChange,
  onDelete,
}: {
  el: EditorElement;
  onChange: (updates: Partial<EditorElement>) => void;
  onDelete: () => void;
}) {
  const style = el.style as Record<string, unknown>;
  const content = el.content as Record<string, unknown>;

  const updateStyle = (key: string, value: unknown) => {
    onChange({ style: { ...style, [key]: value } });
  };

  const updateContent = (key: string, value: unknown) => {
    onChange({ content: { ...content, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {el.type}
        </span>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">X (%)</label>
          <input
            type="number"
            value={Math.round(el.position.x)}
            onChange={(e) => onChange({ position: { ...el.position, x: Number(e.target.value) } })}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
            min="0" max="100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Y (%)</label>
          <input
            type="number"
            value={Math.round(el.position.y)}
            onChange={(e) => onChange({ position: { ...el.position, y: Number(e.target.value) } })}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
            min="0" max="100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Width (%)</label>
          <input
            type="number"
            value={Math.round(el.size.width)}
            onChange={(e) => onChange({ size: { ...el.size, width: Number(e.target.value) } })}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
            min="5" max="100"
          />
        </div>
      </div>

      {/* Text-specific */}
      {el.type === "TEXT" && (
        <>
          <Textarea
            label="Text"
            value={content.text as string || ""}
            onChange={(e) => updateContent("text", e.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Font Size (px)</label>
              <input
                type="number"
                value={style.fontSize as number || 24}
                onChange={(e) => updateStyle("fontSize", Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                min="8" max="120"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Font Weight</label>
              <select
                value={style.fontWeight as number || 400}
                onChange={(e) => updateStyle("fontWeight", Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
              >
                <option value={300}>Light</option>
                <option value={400}>Regular</option>
                <option value={500}>Medium</option>
                <option value={600}>Semibold</option>
                <option value={700}>Bold</option>
                <option value={800}>Extra Bold</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.color as string || "#ffffff"}
                onChange={(e) => updateStyle("color", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={style.color as string || "#ffffff"}
                onChange={(e) => updateStyle("color", e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Alignment</label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle("textAlign", align)}
                  className={cn(
                    "flex-1 py-1 text-xs rounded border transition-colors",
                    style.textAlign === align
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {align[0].toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image-specific */}
      {el.type === "IMAGE" && (
        <>
          <Input
            label="Image URL"
            value={content.src as string || ""}
            onChange={(e) => updateContent("src", e.target.value)}
            placeholder="https://..."
            type="url"
          />
          <Input
            label="Alt Text"
            value={el.altText || ""}
            onChange={(e) => onChange({ altText: e.target.value })}
            placeholder="Describe the image"
            hint="Required for accessibility and SEO"
          />
          <Input
            label="Link URL (optional)"
            value={el.link || ""}
            onChange={(e) => onChange({ link: e.target.value })}
            placeholder="https://..."
            type="url"
          />
        </>
      )}

      {/* CTA-specific */}
      {el.type === "CTA" && (
        <>
          <Input
            label="Button Label"
            value={content.label as string || ""}
            onChange={(e) => updateContent("label", e.target.value)}
            placeholder="Learn More"
          />
          <Input
            label="Button URL"
            value={content.url as string || ""}
            onChange={(e) => updateContent("url", e.target.value)}
            placeholder="https://..."
            type="url"
          />
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Button Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.backgroundColor as string || "#ffffff"}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="color"
                value={style.color as string || "#000000"}
                onChange={(e) => updateStyle("color", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                title="Text color"
              />
            </div>
          </div>
        </>
      )}

      {/* Video-specific */}
      {el.type === "VIDEO" && (
        <>
          <Input
            label="Video URL"
            value={content.src as string || ""}
            onChange={(e) => updateContent("src", e.target.value)}
            placeholder="https://..."
            type="url"
          />
          <Input
            label="Poster Image URL"
            value={content.poster as string || ""}
            onChange={(e) => updateContent("poster", e.target.value)}
            placeholder="https://... (thumbnail)"
            type="url"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoplay"
              checked={content.autoplay as boolean ?? true}
              onChange={(e) => updateContent("autoplay", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoplay" className="text-xs text-gray-700">Autoplay</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="loop"
              checked={content.loop as boolean ?? true}
              onChange={(e) => updateContent("loop", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="loop" className="text-xs text-gray-700">Loop</label>
          </div>
        </>
      )}
    </div>
  );
}
