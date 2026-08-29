"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Plus, Copy, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { EditorPage } from "./StoryEditorClient";

interface Props {
  pages: EditorPage[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDuplicate: (i: number) => void;
  onDelete: (i: number) => void;
  onMove: (from: number, to: number) => void;
}

export default function PagePanel({
  pages,
  selectedIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
}: Props) {
  return (
    <aside className="w-40 bg-gray-800 flex flex-col flex-shrink-0 overflow-hidden border-r border-gray-700">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Pages
        </span>
        <span className="text-xs text-gray-500">{pages.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-2 px-2">
        {pages.map((page, i) => {
          const bgImage = page.elements.find(
            (el) => el.type === "BACKGROUND" && (el.content as { src?: string }).src
          );
          const bgSrc = bgImage
            ? (bgImage.content as { src: string }).src
            : null;

          return (
            <div
              key={page.id}
              className={cn(
                "relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                selectedIndex === i
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-600"
              )}
              style={{ aspectRatio: "9/16" }}
              onClick={() => onSelect(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(i)}
              aria-pressed={selectedIndex === i}
              aria-label={`Page ${i + 1}`}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: page.background || "#000" }}
              />
              {bgSrc && (
                <Image
                  src={bgSrc}
                  alt={`Page ${i + 1} background`}
                  fill
                  className="object-cover opacity-70"
                  sizes="120px"
                />
              )}

              {/* Page number */}
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-white text-xs font-medium bg-black/40 px-1.5 py-0.5 rounded">
                  {i + 1}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-1 right-1 hidden group-hover:flex flex-col gap-0.5">
                {i > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMove(i, i - 1); }}
                    className="w-5 h-5 bg-black/60 text-white rounded flex items-center justify-center hover:bg-black/80"
                    aria-label="Move page up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                )}
                {i < pages.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMove(i, i + 1); }}
                    className="w-5 h-5 bg-black/60 text-white rounded flex items-center justify-center hover:bg-black/80"
                    aria-label="Move page down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(i); }}
                  className="w-5 h-5 bg-black/60 text-white rounded flex items-center justify-center hover:bg-black/80"
                  aria-label="Duplicate page"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(i); }}
                  className="w-5 h-5 bg-red-600/80 text-white rounded flex items-center justify-center hover:bg-red-600"
                  aria-label="Delete page"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add page */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-white border border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          aria-label="Add new page"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Add Page
        </button>
      </div>
    </aside>
  );
}
