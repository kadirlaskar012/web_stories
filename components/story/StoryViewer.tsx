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
  Play,
  ExternalLink,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronUp,
  Volume2,
  VolumeX,
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
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const page = pages[currentPage];
  const duration = (page?.duration || 7) * 1000;

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
      setProgress(0);
    } else {
      setIsPaused(true);
    }
  }, [currentPage, pages.length]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      setProgress(0);
    }
  }, [currentPage]);

  // Google Web Stories Auto-Progression Engine
  useEffect(() => {
    if (isPaused || isHolding) {
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
  }, [currentPage, isPaused, isHolding, duration, goNext, pages.length]);

  // Reset progress when page index changes
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentPage]);

  // Keyboard navigation shortcuts
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

  // Handle Touch Start (detects hold vs tap & registers swipe start coords)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    // Trigger hold pause after 200ms of pressing
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, 200);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (isHolding) {
      setIsHolding(false);
      return;
    }

    // Swipe down to close
    if (diffY > 90 && Math.abs(diffX) < 60) {
      onClose?.();
      return;
    }

    // Horizontal swipe
    if (Math.abs(diffX) > 45) {
      if (diffX < 0) goNext();
      else goPrev();
      return;
    }

    // Tap Left 30% or Right 70%
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.changedTouches[0].clientX - rect.left;
      if (x < rect.width * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    }
  };

  // Mouse click tap handler for Desktop
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

  const handleMouseDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, 200);
  };

  const handleMouseUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHolding) {
      setIsHolding(false);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl select-none"
      role="region"
      aria-label="Google Web Story Player"
    >
      {/* Desktop Left/Right Navigation Controls */}
      {currentPage > 0 && (
        <button
          onClick={goPrev}
          className="hidden md:flex absolute left-8 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all shadow-2xl hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentPage < pages.length - 1 && (
        <button
          onClick={goNext}
          className="hidden md:flex absolute right-8 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all shadow-2xl hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Story 9:16 Canvas */}
      <div
        ref={containerRef}
        className="story-canvas relative z-20 overflow-hidden rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10"
        style={{
          width: "min(100vw, calc(100vh * 9 / 16))",
          height: "min(100vh, calc(100vw * 16 / 9))",
          maxHeight: "92vh",
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Slide ${currentPage + 1} of ${pages.length}`}
      >
        {/* Base Dynamic Background */}
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
                <span className="text-xs text-white/80 font-medium">Live Dispatch</span>
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
                className="w-full py-3.5 px-6 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (ctaElement && (ctaElement.content as any)?.url) {
                    window.location.href = (ctaElement.content as any).url;
                  }
                }}
              >
                <span>{ctaElement ? (ctaElement.content as any)?.label : "SWIPE UP FOR DETAILS"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ─── 7. TECH LAUNCH & GADGET SPOTLIGHT ─── */}
        {layoutType === "tech-spotlight" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#050b14]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-50" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/70 to-transparent pointer-events-none" />

            <div className="relative z-20 pt-8 space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "HARDWARE REVEAL"}
              </span>
              <p className="text-xs text-cyan-400 font-mono font-bold mt-1">
                {subheadText || "3nm Architecture • 45% Lower Power"}
              </p>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-cyan-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR SPECS</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 8. INVESTIGATIVE DEEP DIVE ─── */}
        {layoutType === "investigative-report" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-slate-100 bg-[#0b0c10]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-60 grayscale" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />

            <div className="relative z-20 pt-8 space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-red-700 text-white font-black text-xs uppercase tracking-widest shadow">
                {badgeText || "SPECIAL INVESTIGATION"}
              </span>
              <p className="text-[11px] text-red-400 font-mono">{locationDate || "SPECIAL DISPATCH"}</p>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight drop-shadow">
                {headingText}
              </h2>
              <div className="w-12 h-1 bg-red-600" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 font-serif">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-white/80 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR EVIDENCE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 9. SPORTS BULLETIN – GAME NIGHT ─── */}
        {layoutType === "sports-bulletin" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#0a0d18]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-75" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/40 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "FINAL SCORE"}
              </span>
              <span className="px-3 py-1 rounded bg-black/60 text-amber-400 font-black text-xs font-mono border border-white/20">
                {subheadText || "FINAL ROUND"}
              </span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase drop-shadow">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-orange-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR HIGHLIGHTS</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 10. OPINION & OP-ED COLUMN ─── */}
        {layoutType === "opinion-column" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-slate-900 bg-[#f4efe6]">
            <div className="pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-stone-800 text-white font-black text-xs uppercase tracking-wider">
                {badgeText || "OP-ED COLUMN"}
              </span>
              <span className="text-xs font-bold text-stone-600">{publisherName}</span>
            </div>

            <div className="space-y-3 my-auto">
              <span className="text-5xl text-stone-400 font-serif leading-none block">“</span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-950 leading-tight">
                {headingText}
              </h2>
              <div className="w-8 h-1 bg-stone-800" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {descriptionText}
              </p>
              <p className="text-xs font-black text-stone-900 italic pt-2">
                — {quoteAuthor || "By Editorial Contributor"}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-stone-600 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP TO READ</span>
            </div>
          </div>
        )}

        {/* ─── 11. TRAVEL & WANDERLUST GUIDE ─── */}
        {layoutType === "travel-guide" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-amber-100 bg-[#1c130d]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-80" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-950/20 to-black/50 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "CITY GUIDE"}
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono tracking-wider">
                {subheadText || "DESTINATION"}
              </span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white leading-tight drop-shadow">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-amber-200 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-amber-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR ITINERARY</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 12. FINANCE & MARKET MOVER ─── */}
        {layoutType === "finance-market" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-emerald-400 bg-[#06100d]">
            <div className="pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {badgeText || "MARKET MOVERS"}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {subheadText || "+2.4% NASDAQ"}
              </span>
            </div>

            <div className="space-y-4 my-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {descriptionText}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-emerald-400 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR ANALYSIS</span>
            </div>
          </div>
        )}

        {/* ─── 13. SCIENCE & BREAKTHROUGH DISCOVERY ─── */}
        {layoutType === "science-discovery" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-teal-300 bg-[#041417]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-60" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#041417] via-[#041417]/50 to-transparent pointer-events-none" />

            <div className="relative z-20 pt-8">
              <span className="inline-block px-3 py-1 rounded bg-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "SCIENCE & NATURE"}
              </span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <p className="text-[10px] text-teal-400 font-mono">{sourceText || "Published in Nature"}</p>
              <div className="pt-2 flex flex-col items-center justify-center text-teal-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR PAPER</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 14. CULINARY & GOURMET REVIEW ─── */}
        {layoutType === "culinary-review" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-amber-200 bg-[#160d09]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-80" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-rose-950/20 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "MICHELIN GUIDE ★★★"}
              </span>
              <span className="text-xs text-amber-400 italic font-serif">
                {subheadText || "Gourmet Tasting"}
              </span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight drop-shadow">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-amber-300 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MENU</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 15. CLIMATE & EARTH PULSE ─── */}
        {layoutType === "climate-pulse" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-emerald-300 bg-[#06120c]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-70" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-emerald-950/30 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-emerald-800 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "PLANET PULSE"}
              </span>
              <span className="text-xs font-mono text-emerald-400">{subheadText || "Earth Observation"}</span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-emerald-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR METRICS</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 16. AUTOMOTIVE & SPEED SHOWCASE ─── */}
        {layoutType === "automotive-showcase" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-red-400 bg-[#08080a]">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-80" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-3 py-1 rounded bg-zinc-800 text-white border border-zinc-700 font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "TRACK TEST"}
              </span>
              <span className="text-xs font-mono font-bold text-red-400">{subheadText || "0-60 in 1.8s"}</span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase drop-shadow">
                {headingText}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-snug drop-shadow line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-red-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR LAP VIDEO</span>
              </div>
            </div>
          </div>
        )}
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

        {/* Google Web Stories Segmented Progress Bar Rail */}
        <div className="absolute top-0 inset-x-0 z-30 flex gap-1.5 p-3.5 pointer-events-none">
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

        {/* Top Header Information & Controls */}
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

        {/* Pause/Hold Indicator */}
        {(isPaused || isHolding) && (
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
