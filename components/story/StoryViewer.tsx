"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { StoryPage, StoryElement } from "@prisma/client";
import { X, ChevronLeft, ChevronRight, Share2, Play, Pause, ExternalLink } from "lucide-react";

type PageWithElements = StoryPage & { elements: StoryElement[] };

interface StoryViewerProps {
  pages: PageWithElements[];
  title: string;
  authorName: string;
  publisherName: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

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
  const [copied, setCopied] = useState(false);
  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
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
    startTimeRef.current = performance.now() - startProgress * duration;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      progressRef.current = p;
      setProgress(p);

      if (p >= 1) {
        if (currentPage < pages.length - 1) {
          goNext();
        } else {
          setIsPaused(true);
        }
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [currentPage, isPaused, duration, goNext, pages.length]);

  // Reset progress when page changes
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      if (e.key === "Escape") onClose?.();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) goPrev();
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden select-none"
    >
      {/* Dynamic Ambient Glow matching Slide Cover */}
      {bgElement && (bgElement.content as { src?: string })?.src && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 pointer-events-none hidden md:block"
          style={{ backgroundImage: `url(${(bgElement.content as { src: string }).src})` }}
        />
      )}

      {/* Desktop Navigation Chevrons */}
      {currentPage > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="hidden md:flex absolute left-8 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white items-center justify-center transition-all hover:scale-110 shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentPage < pages.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="hidden md:flex absolute right-8 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md text-white items-center justify-center transition-all hover:scale-110 shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story 9:16 Canvas */}
      <div
        className="story-canvas relative z-20"
        style={{
          width: "min(100vw, calc(100vh * 9 / 16))",
          height: "min(100vh, calc(100vw * 16 / 9))",
          maxHeight: "92vh",
        }}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Slide ${currentPage + 1} of ${pages.length}`}
      >
        {/* Background Color & Image */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: bgColor }}
        />

        {bgElement && (bgElement.content as { src?: string })?.src && (
          <Image
            src={(bgElement.content as { src: string }).src}
            alt=""
            fill
            className="object-cover transition-opacity duration-300"
            style={{
              opacity:
                typeof (bgElement.style as { opacity?: number } | null)?.opacity === "number"
                  ? (bgElement.style as { opacity: number }).opacity
                  : 1,
            }}
            priority
            aria-hidden="true"
          />
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

        {/* Segmented Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 flex gap-1.5 p-3.5">
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

        {/* Top Header Information */}
        <div className="absolute top-7 inset-x-0 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-black">
                {publisherName ? publisherName[0] : "S"}
              </span>
            </div>
            <div className="drop-shadow-md">
              <p className="text-white text-xs font-bold leading-none">
                {publisherName || "StoryFlow"}
              </p>
              <p className="text-white/80 text-[11px] font-medium mt-0.5">{authorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-md"
              aria-label="Share story"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Button */}
            {showCloseButton && onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-md"
                aria-label="Close story"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pause Indicator Toast */}
        {isPaused && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-fade-in">
              <Pause className="w-6 h-6 fill-white" />
            </div>
          </div>
        )}

        {/* Share Copied Toast */}
        {copied && (
          <div className="absolute top-16 inset-x-0 z-40 flex justify-center pointer-events-none animate-fade-in">
            <span className="px-4 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-white/20">
              Link copied to clipboard!
            </span>
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
              className="absolute z-20 pointer-events-none p-2"
              style={{
                left: `${pos.x ?? 0}%`,
                top: `${pos.y ?? 0}%`,
                width: `${size.width ?? 90}%`,
              }}
            >
              <p
                style={{
                  fontSize: style.fontSize ? `${style.fontSize}px` : "24px",
                  fontWeight: style.fontWeight || 700,
                  color: (style.color as string) || "#ffffff",
                  lineHeight: style.lineHeight || 1.3,
                  textShadow: (style.textShadow as string) || "0 3px 12px rgba(0,0,0,0.85)",
                  textAlign: (style.textAlign as React.CSSProperties["textAlign"]) || "left",
                }}
              >
                {content.text}
              </p>
            </div>
          );
        })}

        {/* Call to Action (CTA) Button */}
        {ctaElement && (
          <div
            className="absolute bottom-6 inset-x-0 z-30 flex justify-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={(ctaElement.content as { url?: string })?.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-xs sm:text-sm shadow-2xl hover:scale-105 transition-transform"
            >
              <span>{(ctaElement.content as { label?: string })?.label || "Explore More"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
