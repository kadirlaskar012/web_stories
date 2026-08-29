"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { StoryPage, StoryElement } from "@prisma/client";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Pause,
  ExternalLink,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronUp,
} from "lucide-react";
import { SlideLayoutType, DataFactItem, TimelineItem } from "@/lib/themes/layouts";

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
  publisherName = "USA DAILY",
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
  const bgColor = page.background || "#0c0d12";

  const layoutMeta = (bgElement?.content as any)?.layoutMeta || {};
  const layoutType: SlideLayoutType = layoutMeta.layoutType || (currentPage === 0 ? "breaking-news" : "news-explainer");

  const headingText = (textElements[0]?.content as any)?.text || "";
  const descriptionText = (textElements[1]?.content as any)?.text || "";
  const badgeText = layoutMeta.badgeText || (currentPage === 0 ? "BREAKING NEWS" : "U.S. NEWS");
  const locationDate = layoutMeta.locationDate || "JUNE 1, 2024 | CALIFORNIA, USA";
  const subheadText = layoutMeta.subheadText || "";
  const sourceText = layoutMeta.sourceText || "Source: Official Dispatch";
  const quoteAuthor = layoutMeta.quoteAuthor || "";

  const statsList: DataFactItem[] = layoutMeta.statsList || [
    { icon: "users", stat: "272K", label: "Jobs added in May", subtext: "vs. 165K in April" },
    { icon: "trending", stat: "3.9%", label: "Unemployment Rate", subtext: "Unchanged from April" },
    { icon: "dollar", stat: "4.1%", label: "Average Hourly Earnings", subtext: "vs. May 2023" },
    { icon: "briefcase", stat: "8.1M", label: "Job Openings", subtext: "at the end of April" },
  ];

  const timelineList: TimelineItem[] = layoutMeta.timelineList || [
    { time: "2:45 PM", text: "Severe storms reported across Texas and Oklahoma." },
    { time: "3:30 PM", text: "Tornado warnings issued for 6 Midwestern states." },
    { time: "4:10 PM", text: "Over 120,000 utility customers without power." },
    { time: "4:45 PM", text: "Emergency rescue operations underway in affected counties." },
  ];

  const isLightExplainer = layoutType === "news-explainer";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl select-none"
      role="region"
      aria-label="USA News Web Story Viewer"
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
        className="story-canvas relative z-20 overflow-hidden rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10"
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
        {/* Base Background */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: isLightExplainer ? "#f7f4ed" : layoutType === "data-facts" ? "#070d1d" : bgColor }}
        />

        {/* ─── 1. BREAKING NEWS – BOLD ─── */}
        {layoutType === "breaking-news" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 pointer-events-none" />

            {/* Top Brand Tag */}
            <div className="relative z-20 pt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-600 font-black text-xs tracking-wider text-white shadow">
                  {publisherName}
                </span>
                <span className="text-xs text-white/80 font-medium">2h ago</span>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 space-y-3 pb-4">
              <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                {badgeText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                {headingText}
              </h1>
              <p className="text-sm text-slate-200 leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-3">
                {descriptionText}
              </p>
              <div className="text-xs font-bold text-red-400 border-l-2 border-red-500 pl-2 uppercase tracking-wide">
                {locationDate}
              </div>
              <div className="pt-3 flex flex-col items-center justify-center text-white/80 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 2. NEWS EXPLAINER – EDITORIAL ─── */}
        {layoutType === "news-explainer" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-slate-900 bg-[#f7f4ed]">
            {/* Header */}
            <div className="pt-8 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="font-mono">{`0${currentPage + 1} / 0${pages.length}`}</span>
              <span className="font-black tracking-widest text-slate-950">{publisherName}</span>
            </div>

            {/* Middle Content */}
            <div className="space-y-4 my-auto">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-950 leading-tight">
                {headingText}
              </h2>
              <div className="w-10 h-1 bg-red-600 rounded-full" />
              <p className="text-sm text-slate-800 leading-relaxed font-sans">
                {descriptionText}
              </p>

              {bgElement && (bgElement.content as any)?.src && (
                <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-slate-300">
                  <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="flex flex-col items-center justify-center text-slate-600 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP</span>
            </div>
          </div>
        )}

        {/* ─── 3. PHOTO NEWS – IMMERSIVE ─── */}
        {layoutType === "photo-news" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 pointer-events-none" />

            <div className="relative z-20 pt-8" />

            {/* Bottom */}
            <div className="relative z-20 space-y-3 pb-4">
              <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                {badgeText}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                {headingText}
              </h2>
              <p className="text-sm text-slate-200 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-3 flex flex-col items-center justify-center text-white/80 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. DATA / FACTS – INFOGRAPHIC ─── */}
        {layoutType === "data-facts" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#070d1d]">
            {/* Header */}
            <div className="pt-8 space-y-2">
              <span className="inline-block px-3 py-1 rounded bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {headingText}
              </h2>
            </div>

            {/* 4 Metric Cards */}
            <div className="space-y-2.5 my-auto">
              {statsList.map((item, idx) => {
                const Icon =
                  item.icon === "users"
                    ? Users
                    : item.icon === "trending"
                    ? TrendingUp
                    : item.icon === "dollar"
                    ? DollarSign
                    : Briefcase;
                const colors = [
                  "text-cyan-400 bg-cyan-500/10",
                  "text-emerald-400 bg-emerald-500/10",
                  "text-amber-400 bg-amber-500/10",
                  "text-purple-400 bg-purple-500/10",
                ];
                const activeColor = colors[idx % colors.length];

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5 backdrop-blur-sm"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeColor} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black tracking-tight text-white">{item.stat}</span>
                        <span className="text-xs font-bold text-slate-200 truncate">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.subtext}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="space-y-2 text-center">
              <p className="text-[10px] text-slate-400">{sourceText}</p>
              <div className="flex flex-col items-center justify-center text-cyan-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 5. LIVE UPDATE – TIMELINE ─── */}
        {layoutType === "live-update" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#0d0f15]">
            {/* Header */}
            <div className="pt-8 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE UPDATE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">
                {headingText}
              </h2>
              <p className="text-xs text-slate-400 font-medium">{locationDate}</p>
            </div>

            {/* Connected Timeline */}
            <div className="border-l-2 border-red-600 pl-4 space-y-4 my-auto">
              {timelineList.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-[#0d0f15]" />
                  <span className="text-xs font-black text-red-400 block">{item.time}</span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-center text-white/80 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
            </div>
          </div>
        )}

        {/* ─── 6. ENTERTAINMENT – MAGAZINE ─── */}
        {layoutType === "entertainment-magazine" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-85" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/20 to-black/60 pointer-events-none" />

            {/* Header */}
            <div className="relative z-20 pt-8 space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-purple-600 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h1 className="font-serif font-black text-4xl sm:text-5xl text-white leading-none mt-2">
                {headingText}
              </h1>
              <p className="font-serif italic text-base sm:text-lg text-pink-400 font-bold">
                {subheadText || "Stars in New Blockbuster Movie"}
              </p>
            </div>

            {/* Bottom */}
            <div className="relative z-20 space-y-4 pb-4">
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-snug drop-shadow">
                {descriptionText}
              </p>
              <div
                className="w-full py-3.5 px-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{ctaElement ? (ctaElement.content as any)?.label : "SWIPE UP FOR DETAILS"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ─── 7. QUOTE SPOTLIGHT ─── */}
        {layoutType === "quote-spotlight" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white text-center bg-slate-950">
            <span className="text-5xl text-amber-400 font-serif leading-none mt-12 block">“</span>
            <blockquote className="font-serif italic text-lg sm:text-xl font-bold text-white px-2 leading-relaxed my-auto">
              {headingText}
            </blockquote>
            <cite className="text-xs font-black text-amber-400 uppercase tracking-widest block not-italic mb-10">
              — {quoteAuthor || "Official Statement"}
            </cite>
          </div>
        )}

        {/* ─── 8. CTA FINALE ─── */}
        {layoutType === "cta-finale" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white text-center bg-[#090d16]">
            <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider mx-auto mt-12">
              STAY INFORMED
            </span>
            <div className="space-y-3 my-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <p className="text-sm text-slate-300 max-w-xs mx-auto">
                {descriptionText}
              </p>
            </div>
            <div className="mb-8" onClick={(e) => e.stopPropagation()}>
              <a
                href={(ctaElement?.content as any)?.url || "/stories"}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-2xl transition-all"
              >
                <span>{(ctaElement?.content as any)?.label || "Read Full Story"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 flex gap-1.5 p-3.5">
          {pages.map((_, i) => (
            <div key={i} className="story-progress-bar flex-1" aria-hidden="true">
              <div
                className={`story-progress-fill ${isLightExplainer ? "bg-slate-900" : "bg-white"}`}
                style={{
                  transform: `scaleX(${i < currentPage ? 1 : i === currentPage ? progress : 0})`,
                  transitionDuration: "0ms",
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header Information */}
        <div className="absolute top-7 inset-x-0 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow ${
                isLightExplainer ? "bg-slate-900 text-white" : "bg-white/20 text-white backdrop-blur-md"
              }`}
            >
              {publisherName[0]}
            </div>
            <div>
              <p className={`text-xs font-black leading-none ${isLightExplainer ? "text-slate-900" : "text-white"}`}>
                {publisherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow ${
                isLightExplainer
                  ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                  : "bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
              }`}
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
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow ${
                  isLightExplainer
                    ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    : "bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
                }`}
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
