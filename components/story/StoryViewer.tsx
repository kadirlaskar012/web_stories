"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoryPage, StoryElement } from "@prisma/client";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from "lucide-react";

type PageWithElements = StoryPage & { elements: StoryElement[] };

interface StoryViewerProps {
  pages: PageWithElements[];
  title: string;
  authorName: string;
  publisherName: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const DEFAULT_DURATION = 7000; // 7 seconds per page

export function StoryViewer({
  pages,
  title,
  authorName,
  publisherName,
  onClose,
  showCloseButton = true,
}: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const page = pages[currentPage];
  const duration = (page?.duration || 7) * 1000;

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
      setProgress(0);
    }
  }, [currentPage, pages.length]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      setProgress(0);
    }
  }, [currentPage]);

  // Auto-progression
  useEffect(() => {
    if (isPaused) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const startProgress = progressRef.current;
    startTimeRef.current = performance.now() - (startProgress * duration);

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      progressRef.current = p;
      setProgress(p);

      if (p >= 1) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [currentPage, isPaused, duration, goNext]);

  // Reset progress when page changes
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentPage]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      if (e.key === "Escape") onClose?.();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goPrev();
      else goNext();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      goPrev();
    } else if (x > rect.width - third) {
      goNext();
    } else {
      setIsPaused((p) => !p);
    }
  };

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <p>No pages in this story.</p>
      </div>
    );
  }

  const bgColor = page?.background || "#000000";
  const bgElement = page?.elements?.find((el) => el.type === "BACKGROUND");
  const textElements = page?.elements?.filter((el) => el.type === "TEXT") || [];
  const ctaElement = page?.elements?.find((el) => el.type === "CTA");
  const imageElement = page?.elements?.find(
    (el) => el.type === "IMAGE"
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center"
      style={{ touchAction: "pan-y" }}
    >
      {/* Story Canvas */}
      <div
        className="story-canvas relative max-h-full"
        style={{
          width: "min(100%, calc(100vh * 9 / 16))",
          height: "min(100vh, calc(100vw * 16 / 9))",
        }}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Story page ${currentPage + 1} of ${pages.length}`}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bgColor }}
        />

        {bgElement && (bgElement.content as { src?: string })?.src && (
          <Image
            src={(bgElement.content as { src: string }).src}
            alt=""
            fill
            className="object-cover"
            style={{
              opacity:
                typeof (bgElement.style as { opacity?: number } | null)?.opacity ===
                "number"
                  ? (bgElement.style as { opacity: number }).opacity
                  : 1,
            }}
            priority
            aria-hidden="true"
          />
        )}

        {/* Progress bars */}
        <div className="absolute top-0 inset-x-0 z-10 flex gap-1 p-3">
          {pages.map((_, i) => (
            <div key={i} className="story-progress-bar flex-1" aria-hidden="true">
              <div
                className="story-progress-fill"
                style={{
                  transform: `scaleX(${
                    i < currentPage ? 1 : i === currentPage ? progress : 0
                  })`,
                  transitionDuration: i === currentPage ? "0ms" : "0ms",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 inset-x-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {publisherName[0]}
              </span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">
                {publisherName}
              </p>
              <p className="text-white/70 text-xs mt-0.5">{authorName}</p>
            </div>
          </div>

          {showCloseButton && onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              aria-label="Close story"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                <div className="w-1.5 h-6 bg-white rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Text Elements */}
        {textElements.map((el) => {
          const content = (el.content as { text?: string }) || {};
          const pos = (el.position as { x: number; y: number }) || { x: 0, y: 0 };
          const size = (el.size as { width: number; height: number }) || { width: 100, height: 50 };
          const style = (el.style as Record<string, number | string>) || {};

          return (
            <div
              key={el.id}
              className="absolute z-10 pointer-events-none"
              style={{
                left: `${pos.x ?? 0}%`,
                top: `${pos.y ?? 0}%`,
                width: `${size.width ?? 100}%`,
              }}
            >
              <p
                style={{
                  fontSize: style.fontSize ? `${style.fontSize}px` : "24px",
                  fontWeight: style.fontWeight || 400,
                  color: (style.color as string) || "#ffffff",
                  lineHeight: style.lineHeight || 1.4,
                  textShadow:
                    (style.textShadow as string) ||
                    "0 2px 8px rgba(0,0,0,0.5)",
                  textAlign: (style.textAlign as React.CSSProperties["textAlign"]) || "left",
                }}
              >
                {content.text}
              </p>
            </div>
          );
        })}

        {/* CTA Button */}
        {ctaElement && (
          <div className="absolute bottom-12 inset-x-0 z-10 flex justify-center px-6">
            <Link
              href={(ctaElement.content as { url?: string }).url || "#"}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {(ctaElement.content as { label?: string }).label ||
                "Learn More"}
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Nav arrows (visible on non-touch) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={currentPage === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center disabled:opacity-0 hover:bg-black/40 transition-colors hidden sm:flex"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          disabled={currentPage === pages.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center disabled:opacity-0 hover:bg-black/40 transition-colors hidden sm:flex"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Page counter */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center z-10">
        <div className="bg-black/30 text-white text-xs px-3 py-1 rounded-full">
          {currentPage + 1} / {pages.length}
        </div>
      </div>
    </div>
  );
}
