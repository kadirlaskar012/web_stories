"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { StoryPage, StoryElement } from "@prisma/client";
import { X, ChevronLeft, ChevronRight, Share2, Play, Pause, ExternalLink, ArrowRight } from "lucide-react";
import { SlideLayoutType } from "@/lib/themes/layouts";

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

  // Tap handling
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      goPrev();
    } else {
      goNext();
    }
  };

  // Touch gestures for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Swipe down to close
    if (diffY > 80 && Math.abs(diffX) < 50) {
      onClose?.();
      return;
    }

    // Horizontal swipe
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) goNext();
      else goPrev();
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!page) return null;

  const bgElement = page.elements.find((el) => el.type === "BACKGROUND");
  const textElements = page.elements.filter((el) => el.type === "TEXT");
  const ctaElement = page.elements.find((el) => el.type === "CTA");
  const bgColor = page.background || "#0f172a";

  const layoutMeta = (bgElement?.content as any)?.layoutMeta || {};
  const layoutType: SlideLayoutType = layoutMeta.layoutType || (currentPage === 0 ? "cover-hero" : "floating-card");

  const headingText = (textElements[0]?.content as any)?.text || "";
  const descriptionText = (textElements[1]?.content as any)?.text || "";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl select-none"
      role="region"
      aria-label="Web Story Viewer"
    >
      {/* Desktop chevrons */}
      {currentPage > 0 && (
        <button
          onClick={goPrev}
          className="hidden md:flex absolute left-8 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentPage < pages.length - 1 && (
        <button
          onClick={goNext}
          className="hidden md:flex absolute right-8 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story 9:16 Canvas */}
      <div
        className="story-canvas relative z-20 overflow-hidden rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10"
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
        {/* Background Canvas Base */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: bgColor }}
        />

        {/* ─── 1. LAYOUT: SPLIT HALF & HALF ─── */}
        {layoutType === "split-half" ? (
          <div className="absolute inset-0 flex flex-col z-10">
            {/* Top 50% Image */}
            <div className="h-1/2 relative overflow-hidden bg-slate-900">
              {bgElement && (bgElement.content as any)?.src && (
                <Image
                  src={(bgElement.content as any).src}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {/* Bottom 50% Solid Editorial Card */}
            <div className="h-1/2 bg-slate-950 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase w-fit inline-block">
                  {publisherName || "Editorial"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {headingText}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                  {descriptionText}
                </p>
              </div>

              {ctaElement && (
                <div onClick={(e) => e.stopPropagation()}>
                  <a
                    href={(ctaElement.content as any)?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{(ctaElement.content as any)?.label || "Learn More"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ─── FULL-BLEED BACKGROUND LAYOUTS ─── */
          <>
            {bgElement && (bgElement.content as any)?.src && (
              <Image
                src={(bgElement.content as any).src}
                alt=""
                fill
                className="object-cover"
                priority
              />
            )}

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none z-10" />

            {/* Dynamic Layout Content Containers */}
            <div className="absolute bottom-12 inset-x-0 z-20 px-6 space-y-4">
              {/* 2. FLOATING GLASS CARD */}
              {layoutType === "floating-card" && (
                <div className="p-5 rounded-3xl bg-black/65 backdrop-blur-xl border border-white/20 shadow-2xl space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                    {publisherName || "Spotlight"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {headingText}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-4">
                    {descriptionText}
                  </p>
                </div>
              )}

              {/* 3. BIG STAT / NUMBER */}
              {layoutType === "big-stat" && (
                <div className="space-y-2">
                  <div className="text-6xl font-black text-amber-300 tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                    {layoutMeta.statNumber || "01"}
                  </div>
                  <h2 className="text-2xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {headingText}
                  </h2>
                  <p className="text-sm text-slate-200 leading-relaxed drop-shadow line-clamp-3">
                    {descriptionText}
                  </p>
                </div>
              )}

              {/* 4. QUOTE SPOTLIGHT */}
              {layoutType === "quote-spotlight" && (
                <div className="text-center space-y-3 py-6">
                  <span className="text-6xl text-amber-300 font-serif leading-none block drop-shadow-lg">
                    “
                  </span>
                  <blockquote className="text-lg sm:text-xl font-bold text-white italic leading-relaxed px-2 drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
                    {headingText}
                  </blockquote>
                  {layoutMeta.quoteAuthor && (
                    <cite className="text-xs font-bold text-amber-300 tracking-wider uppercase block not-italic pt-2 drop-shadow">
                      — {layoutMeta.quoteAuthor}
                    </cite>
                  )}
                </div>
              )}

              {/* 5. STEP LIST */}
              {layoutType === "step-list" && (
                <div className="space-y-2.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs uppercase shadow-lg">
                    {layoutMeta.stepNumber || "STEP 01"}
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight drop-shadow">
                    {headingText}
                  </h2>
                  <p className="text-sm text-slate-200 leading-relaxed drop-shadow line-clamp-4">
                    {descriptionText}
                  </p>
                </div>
              )}

              {/* 6. CTA FINALE */}
              {layoutType === "cta-finale" && (
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow">
                    {headingText}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow">
                    {descriptionText}
                  </p>
                </div>
              )}

              {/* 7. COVER HERO */}
              {layoutType === "cover-hero" && (
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                    {headingText}
                  </h2>
                  <p className="text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-3">
                    {descriptionText}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {ctaElement && (
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={(ctaElement.content as any)?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>{(ctaElement.content as any)?.label || "Explore More"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 flex gap-1.5 p-3.5">
          {pages.map((_, i) => (
            <div key={i} className="story-progress-bar flex-1" aria-hidden="true">
              <div
                className="story-progress-fill"
                style={{
                  transform: `scaleX(${
                    i < currentPage ? 1 : i === currentPage ? progress : 0
                  })`,
                  transitionDuration: "0ms",
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
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-md"
              aria-label="Share story"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

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

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-fade-in">
              <Pause className="w-6 h-6 fill-white" />
            </div>
          </div>
        )}

        {/* Toast */}
        {copied && (
          <div className="absolute top-16 inset-x-0 z-40 flex justify-center pointer-events-none animate-fade-in">
            <span className="px-4 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-white/20">
              Link copied to clipboard!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
