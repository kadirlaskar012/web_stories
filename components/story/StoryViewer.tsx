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
import { SlideLayoutType, DataFactItem, TimelineItem, VersusItem, ChecklistItem } from "@/lib/themes/layouts";

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

  // Reset progress on page change
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentPage]);

  // Keyboard controls
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

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

    // Left 30% / Right 70% tap
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
  const layoutType: SlideLayoutType = layoutMeta.layoutType || (currentPage === 0 ? "breaking-bold" : "split-screen-card");

  const headingText = (textElements[0]?.content as any)?.text || "";
  const descriptionText = (textElements[1]?.content as any)?.text || "";
  const badgeText = layoutMeta.badgeText || (currentPage === 0 ? "BREAKING NEWS" : "EXPLAINER");
  const locationDate = layoutMeta.locationDate || "JUNE 1, 2024 | CALIFORNIA, USA";
  const subheadText = layoutMeta.subheadText || "";
  const sourceText = layoutMeta.sourceText || "Source: Official Dispatch";
  const quoteAuthor = layoutMeta.quoteAuthor || "";
  const rankNumber = layoutMeta.rankNumber || "01";

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

  const isLight = layoutType === "split-screen-card" || layoutType === "polaroid-photo-frame";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl select-none"
      role="region"
      aria-label="Google Web Story Player"
    >
      {/* Desktop Navigation Chevrons */}
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
        {/* Base Background */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: isLight ? "#f7f4ed" : layoutType === "infographic-stats-grid" ? "#070d1d" : bgColor }}
        />

        {/* ─── 1. BREAKING BOLD ─── */}
        {layoutType === "breaking-bold" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-red-600 font-black text-xs tracking-wider text-white shadow">
                {publisherName}
              </span>
              <span className="text-xs text-white/80 font-medium">Live Dispatch</span>
            </div>

            <div className="relative z-20 space-y-3 pb-4">
              <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                {badgeText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase drop-shadow">
                {headingText}
              </h1>
              <p className="text-sm text-slate-200 leading-snug drop-shadow line-clamp-3">
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

        {/* ─── 2. SPLIT SCREEN CARD (50/50) ─── */}
        {layoutType === "split-screen-card" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 text-slate-900 bg-[#f7f4ed]">
            {bgElement && (bgElement.content as any)?.src && (
              <div className="relative w-full h-[45%] rounded-2xl overflow-hidden shadow-lg border border-slate-300">
                <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
              </div>
            )}

            <div className="space-y-3 my-auto">
              <span className="inline-block px-3 py-1 rounded bg-slate-950 text-white font-black text-xs">
                {badgeText}
              </span>
              <h2 className="font-serif font-bold text-2xl text-slate-950 leading-tight">
                {headingText}
              </h2>
              <div className="w-10 h-1 bg-red-600 rounded-full" />
              <p className="text-sm text-slate-800 leading-relaxed font-sans line-clamp-4">
                {descriptionText}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-slate-600 animate-bounce">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP</span>
            </div>
          </div>
        )}

        {/* ─── 3. TOP RANK COUNTDOWN (Giant 01 Numeral) ─── */}
        {layoutType === "top-rank-countdown" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-slate-950 text-white">
            <div className="absolute right-4 top-12 text-[140px] font-black text-white/10 font-mono select-none pointer-events-none leading-none">
              {rankNumber}
            </div>

            <div className="relative z-10 space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <p className="text-xs font-bold text-amber-400">{subheadText}</p>
            </div>

            {bgElement && (bgElement.content as any)?.src && (
              <div className="relative z-10 w-full h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 my-auto">
                <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
              </div>
            )}

            <div className="relative z-10 space-y-2 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                {descriptionText}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center text-amber-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. GLASSMORPHISM FLOATING CARD ─── */}
        {layoutType === "glassmorphism-card" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-60" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            <div className="relative z-20 my-auto p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3">
              <span className="inline-block px-3 py-1 rounded bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">
                {headingText}
              </h2>
              <p className="text-xs text-cyan-300 font-mono font-bold">{subheadText}</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {descriptionText}
              </p>
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center text-cyan-400 animate-bounce pb-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR SPECS</span>
            </div>
          </div>
        )}

        {/* ─── 5. POLAROID RETRO FRAME ─── */}
        {layoutType === "polaroid-photo-frame" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-[#f4ede4] text-slate-900">
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-blue-600 text-white font-bold text-xs uppercase">
                {badgeText}
              </span>
              <h2 className="font-serif font-black text-xl text-slate-950 leading-tight">
                {headingText}
              </h2>
            </div>

            <div className="relative my-auto bg-white p-3.5 pb-8 rounded-xl shadow-2xl border border-slate-300/80 rotate-[-2deg]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 rounded-sm shadow-sm rotate-[4deg]" />
              <div className="relative w-full h-48 rounded overflow-hidden">
                {bgElement && (bgElement.content as any)?.src && (
                  <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono text-center mt-2.5">
                {locationDate}
              </p>
            </div>

            <div className="space-y-2 pb-2">
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{descriptionText}</p>
              <div className="flex flex-col items-center justify-center text-slate-500 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">SWIPE UP</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 6. INFOGRAPHIC STATS GRID ─── */}
        {layoutType === "infographic-stats-grid" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#070d1d]">
            <div className="pt-8 space-y-2">
              <span className="inline-block px-3 py-1 rounded bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {headingText}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 my-auto">
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
                return (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[idx % colors.length]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-black text-white">{item.stat}</div>
                    <p className="text-xs text-slate-300 font-bold truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.subtext}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-center pb-2">
              <p className="text-[10px] text-slate-400">{sourceText}</p>
              <div className="flex flex-col items-center justify-center text-cyan-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 7. CONNECTED TIMELINE ─── */}
        {layoutType === "connected-timeline" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white bg-[#0d0f15]">
            <div className="pt-8 space-y-1.5">
              <span className="px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow w-max">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                LIVE UPDATE
              </span>
              <h2 className="text-xl font-black text-white leading-tight mt-1">
                {headingText}
              </h2>
              <p className="text-xs text-slate-400">{locationDate}</p>
            </div>

            <div className="border-l-2 border-red-600 pl-4 space-y-4 my-auto">
              {timelineList.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-[#0d0f15]" />
                  <span className="text-xs font-black text-red-400 block">{item.time}</span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center text-white/80 animate-bounce pb-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR MORE</span>
            </div>
          </div>
        )}

        {/* ─── 8. BIG QUOTE SPOTLIGHT ─── */}
        {layoutType === "big-quote-spotlight" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-zinc-950 text-white text-center">
            <span className="text-6xl text-amber-400 font-serif leading-none">“</span>
            <div className="space-y-4 my-auto">
              {bgElement && (bgElement.content as any)?.src && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto ring-4 ring-amber-400/40 shadow-2xl">
                  <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" />
                </div>
              )}
              <blockquote className="font-serif italic text-xl sm:text-2xl font-bold text-white px-2 leading-relaxed">
                {headingText}
              </blockquote>
              <cite className="text-xs font-black text-amber-400 uppercase tracking-widest block not-italic">
                — {quoteAuthor || "Senior Columnist"}
              </cite>
            </div>
            <div className="space-y-2 pb-2">
              <p className="text-xs text-slate-400">{descriptionText}</p>
              <div className="flex flex-col items-center justify-center text-amber-400 animate-bounce">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP TO READ</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 9. VERSUS COMPARISON ─── */}
        {layoutType === "versus-comparison" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-zinc-950 text-white">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText || "HEAD-TO-HEAD"}
              </span>
              <h2 className="text-xl font-black mt-2">{headingText}</h2>
              <p className="text-xs text-indigo-300 font-mono">{subheadText}</p>
            </div>

            <div className="relative space-y-3 my-auto">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-cyan-300">Quantum Neural</span>
                  <span className="text-lg font-black text-cyan-400">100 TOPS</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">5W Ultra-Low Power · 0ms Cloud Latency</p>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-2 border-black shadow-2xl">
                VS
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-purple-300">Legacy GPU</span>
                  <span className="text-lg font-black text-purple-400">45 TOPS</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">35W High Power · Cloud Delay Required</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-indigo-400 animate-bounce pb-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR DETAILS</span>
            </div>
          </div>
        )}

        {/* ─── 10. MAGAZINE EDITORIAL CUTOUT ─── */}
        {layoutType === "magazine-cutout" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-white">
            {bgElement && (bgElement.content as any)?.src && (
              <Image src={(bgElement.content as any).src} alt="" fill className="object-cover opacity-85" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/20 to-black/60 pointer-events-none" />

            <div className="relative z-20 pt-8 space-y-1">
              <span className="inline-block px-3 py-1 rounded bg-purple-600 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h1 className="font-serif font-black text-4xl sm:text-5xl text-white leading-none mt-2">
                {headingText}
              </h1>
              <p className="font-serif italic text-base text-pink-400 font-bold">{subheadText}</p>
            </div>

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
                <span>{ctaElement ? (ctaElement.content as any)?.label : "SWIPE UP FOR INTERVIEW"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ─── 11. RECIPE & STEP CHECKLIST ─── */}
        {layoutType === "recipe-step-card" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-[#160d09] text-amber-100">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow">
                {badgeText}
              </span>
              <h2 className="font-serif font-bold text-xl text-white mt-1">{headingText}</h2>
              <p className="text-xs text-amber-300 font-mono">{subheadText}</p>
            </div>

            {bgElement && (bgElement.content as any)?.src && (
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg my-auto">
                <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" />
              </div>
            )}

            <div className="space-y-2 my-auto">
              {[
                { num: "01", text: "Boil fresh pasta 90 seconds in salted water." },
                { num: "02", text: "Swirl French butter with starchy water to form emulsion." },
                { num: "03", text: "Plate immediately and finish with shaved Alba truffles." },
              ].map((st, i) => (
                <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {st.num}
                  </span>
                  <span className="text-xs text-slate-200">{st.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center text-amber-400 animate-bounce pb-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR RECIPE</span>
            </div>
          </div>
        )}

        {/* ─── 12. SPORTS SCOREBOARD & MVP ─── */}
        {layoutType === "sports-scoreboard" && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 pt-16 z-10 bg-[#0a0d18] text-white">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider block text-white/80">FINALS GAME 7</span>
                <span className="text-lg font-black font-mono">LAL 114</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-black/40 text-xs font-black">OT FINAL</span>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase tracking-wider block text-white/80">EAST</span>
                <span className="text-lg font-black font-mono">108 BOS</span>
              </div>
            </div>

            {bgElement && (bgElement.content as any)?.src && (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/20 shadow-2xl my-auto">
                <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" />
              </div>
            )}

            <div className="space-y-3 pb-2">
              <h2 className="text-base font-black text-white">{headingText}</h2>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-white/10 rounded-xl text-center border border-white/10">
                  <span className="text-lg font-black text-orange-400 block">44</span>
                  <span className="text-[9px] uppercase text-slate-400 font-bold">POINTS</span>
                </div>
                <div className="flex-1 p-2 bg-white/10 rounded-xl text-center border border-white/10">
                  <span className="text-lg font-black text-orange-400 block">12</span>
                  <span className="text-[9px] uppercase text-slate-400 font-bold">REBOUNDS</span>
                </div>
                <div className="flex-1 p-2 bg-white/10 rounded-xl text-center border border-white/10">
                  <span className="text-lg font-black text-orange-400 block">8</span>
                  <span className="text-[9px] uppercase text-slate-400 font-bold">ASSISTS</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-orange-400 animate-bounce pt-1">
                <ChevronUp className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIPE UP FOR HIGHLIGHTS</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar Rail */}
        <div className="absolute top-0 inset-x-0 z-30 flex gap-1.5 p-3.5 pointer-events-none">
          {pages.map((_, i) => (
            <div key={i} className="story-progress-bar flex-1" aria-hidden="true">
              <div
                className={`story-progress-fill ${isLight ? "bg-slate-900" : "bg-white"}`}
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
                isLight ? "bg-slate-900 text-white" : "bg-white/20 text-white backdrop-blur-md"
              }`}
            >
              {publisherName[0]}
            </div>
            <div>
              <p className={`text-xs font-black leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                {publisherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow ${
                isLight
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
                  isLight
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
