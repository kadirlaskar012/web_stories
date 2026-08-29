"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Trash2, Move, Type, ImageIcon, Video, Square, Link, Layers } from "lucide-react";
import type { EditorPage, EditorElement } from "./StoryEditorClient";

const ELEMENT_ICONS: Record<string, React.ElementType> = {
  TEXT: Type,
  IMAGE: ImageIcon,
  VIDEO: Video,
  SHAPE: Square,
  CTA: Link,
  BACKGROUND: Layers,
};

interface Props {
  page: EditorPage | undefined;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (type: string) => void;
  onUpdatePage: (updates: Partial<EditorPage>) => void;
}

const ELEMENT_TYPES = [
  { type: "TEXT", label: "Text", icon: Type },
  { type: "IMAGE", label: "Image", icon: ImageIcon },
  { type: "VIDEO", label: "Video", icon: Video },
  { type: "SHAPE", label: "Shape", icon: Square },
  { type: "CTA", label: "CTA", icon: Link },
];

export default function EditorCanvas({
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onUpdatePage,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 });

  if (!page) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 text-sm">
        No page selected
      </div>
    );
  }

  const bgEl = page.elements.find((el) => el.type === "BACKGROUND");
  const bgSrc = bgEl ? (bgEl.content as { src?: string }).src : null;

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-element]")) return;
    onSelectElement(null);
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    el: EditorElement
  ) => {
    e.stopPropagation();
    onSelectElement(el.id);

    // Drag setup
    const canvas = (e.currentTarget as HTMLElement)
      .closest("[data-canvas]") as HTMLElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elX: el.position.x,
      elY: el.position.y,
    });

    const onMouseMove = (me: MouseEvent) => {
      const dx = ((me.clientX - e.clientX) / rect.width) * 100;
      const dy = ((me.clientY - e.clientY) / rect.height) * 100;
      onUpdateElement(el.id, {
        position: {
          x: Math.max(0, Math.min(90, dragStart.elX + dx)),
          y: Math.max(0, Math.min(90, dragStart.elY + dy)),
        },
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Add element toolbar */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
        {ELEMENT_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onAddElement(type)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
            aria-label={`Add ${label}`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        data-canvas
        className="editor-canvas relative"
        style={{
          width: "360px",
          height: "640px",
          backgroundColor: page.background || "#000000",
          cursor: isDragging ? "grabbing" : "default",
          userSelect: "none",
        }}
        onClick={handleCanvasClick}
        aria-label="Story canvas"
      >
        {/* Background image */}
        {bgSrc && (
          <Image
            src={bgSrc}
            alt="Page background"
            fill
            className="object-cover"
            style={{ opacity: (bgEl?.style as { opacity?: number })?.opacity || 1 }}
            sizes="360px"
          />
        )}

        {/* Render elements */}
        {page.elements
          .filter((el) => el.type !== "BACKGROUND")
          .sort((a, b) => a.order - b.order)
          .map((el) => {
            const isSelected = el.id === selectedElementId;
            const pos = el.position;
            const size = el.size;
            const Icon = ELEMENT_ICONS[el.type] || Layers;

            return (
              <div
                key={el.id}
                data-element={el.id}
                className={cn(
                  "absolute cursor-grab active:cursor-grabbing",
                  isSelected && "ring-2 ring-blue-500 ring-offset-1"
                )}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${size.width}%`,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
                role="button"
                tabIndex={0}
                aria-label={`${el.type} element`}
                onKeyDown={(e) => e.key === "Delete" && isSelected && onDeleteElement(el.id)}
              >
                <ElementRenderer el={el} />

                {isSelected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteElement(el.id); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs z-20"
                    aria-label="Delete element"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

        {/* Empty state */}
        {page.elements.filter((el) => el.type !== "BACKGROUND").length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/40 text-sm text-center px-6">
              Click an element type above to add content to this page
            </p>
          </div>
        )}
      </div>

      {/* Canvas size label */}
      <p className="text-xs text-gray-400">360 × 640 · 9:16</p>
    </div>
  );
}

function ElementRenderer({ el }: { el: EditorElement }) {
  const style = el.style as Record<string, unknown>;
  const content = el.content as Record<string, unknown>;

  switch (el.type) {
    case "TEXT":
      return (
        <p
          style={{
            fontSize: `${style.fontSize || 24}px`,
            fontWeight: style.fontWeight as number || 400,
            color: style.color as string || "#ffffff",
            lineHeight: style.lineHeight as number || 1.4,
            textAlign: style.textAlign as React.CSSProperties["textAlign"] || "left",
            textShadow: style.textShadow as string || "0 2px 8px rgba(0,0,0,0.5)",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {content.text as string || "Text"}
        </p>
      );

    case "IMAGE":
      return content.src ? (
        <Image
          src={content.src as string}
          alt={el.altText || ""}
          fill
          className="object-cover"
          sizes="360px"
        />
      ) : (
        <div className="w-full h-24 bg-gray-600 flex items-center justify-center text-gray-400 text-xs rounded">
          No image
        </div>
      );

    case "CTA":
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: style.backgroundColor as string || "#ffffff",
            color: style.color as string || "#000000",
            borderRadius: `${style.borderRadius || 50}px`,
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {content.label as string || "Learn More"}
        </div>
      );

    case "SHAPE":
      return (
        <div
          className="w-full h-10"
          style={{
            backgroundColor: style.backgroundColor as string || "#ffffff",
            opacity: style.opacity as number || 1,
            borderRadius: `${style.borderRadius || 0}px`,
          }}
        />
      );

    default:
      return (
        <div className="w-full h-10 bg-gray-600/50 rounded flex items-center justify-center text-gray-300 text-xs">
          {el.type}
        </div>
      );
  }
}
