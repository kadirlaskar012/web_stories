"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StoryPage, StoryElement } from "@prisma/client";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { SlideLayoutType, DataFactItem, TimelineItem, VersusItem, ChecklistItem } from "@/lib/themes/layouts";

type PageWithElements = StoryPage & { elements: StoryElement[] };

export interface NextStoryInfo {
  id?: string;
  slug: string;
  title: string;
  coverImage?: string | null;
  categoryName?: string;
}

interface StoryViewerProps {
  pages: PageWithElements[];
  storyId?: string;
  title: string;
  authorName: string;
  publisherName: string;
  categorySlug?: string;
  nextStory?: NextStoryInfo | null;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function StoryViewer({
  pages,
  storyId,
  title,
  authorName,
  publisherName = "USA DAILY",
  categorySlug,
  nextStory,
  onClose,
  showCloseButton = true,
}: StoryViewerProps) {
  const router = useRouter();

  // ─── 21. Story State ───────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`sess_${Math.random().toString(36).slice(2, 10)}`);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchHandledRef = useRef<boolean>(false);

  const page = pages[currentPage];
  const duration = (page?.duration || 7) * 1000;

  // Resolve background audio for story or page
  const activeAudioUrl = useMemo(() => {
    const curBg = page?.elements?.find((e: any) => e.type === "BACKGROUND");
    const pageAudio = (curBg?.content as any)?.layoutMeta?.backgroundAudio || (curBg?.content as any)?.layoutMeta?.audioUrl;
    if (pageAudio) return pageAudio;

    const firstBg = pages[0]?.elements?.find((e: any) => e.type === "BACKGROUND");
    return (firstBg?.content as any)?.layoutMeta?.backgroundAudio || (firstBg?.content as any)?.layoutMeta?.audioUrl || "";
  }, [page, pages]);

  const userMutedExplicitlyRef = useRef<boolean>(false);

  const attemptAutoPlayAudio = useCallback(() => {
    if (!activeAudioUrl || !audioRef.current || userMutedExplicitlyRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        setIsMuted(false);
      })
      .catch(() => {
        // Browser requires a user tap/click first
      });
  }, [activeAudioUrl]);

  // Attempt initial autoplay on mount
  useEffect(() => {
    if (activeAudioUrl) {
      attemptAutoPlayAudio();
    }
  }, [activeAudioUrl, attemptAutoPlayAudio]);

  // Audio Playback Sync
  useEffect(() => {
    if (!audioRef.current || !activeAudioUrl) return;

    if (isMuted || isPaused || isHolding || isCompleted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted, isPaused, isHolding, isCompleted, activeAudioUrl]);

  // ─── 20. Real Analytics Tracker Dispatcher ────────────────────────────────
  const trackEvent = useCallback(
    (eventType: string, pageIndex?: number, metadata?: Record<string, any>) => {
      if (!storyId) return;
      try {
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const payload = JSON.stringify({
            storyId,
            eventType,
            pageIndex: pageIndex !== undefined ? pageIndex : currentPage,
            sessionId: sessionIdRef.current,
            metadata,
          });
          navigator.sendBeacon("/api/analytics/events", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/analytics/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storyId,
              eventType,
              pageIndex: pageIndex !== undefined ? pageIndex : currentPage,
              sessionId: sessionIdRef.current,
              metadata,
            }),
          }).catch(() => {});
        }
      } catch {}
    },
    [storyId, currentPage]
  );

  // Track Story Open on Mount
  useEffect(() => {
    trackEvent("story_open", 0, { title });
  }, [trackEvent, title]);

  // ─── 14. Close Handler & Instant Exit Engine ──────────────────────────────
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Pre-warm destination routes on mount so closing is 100% instant (0ms lag)
  useEffect(() => {
    if (categorySlug) {
      router.prefetch(`/category/${categorySlug}`);
    }
    router.prefetch("/");
  }, [categorySlug, router]);

  const handleClose = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsClosing(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    trackEvent("exit", currentPage);
    if (onClose) {
      onClose();
    } else if (categorySlug) {
      router.push(`/category/${categorySlug}`);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [onClose, categorySlug, router, trackEvent, currentPage]);

  // ─── 4 & 5. Navigation (Next / Previous / Continuous Loop) ──────────────────
  const goNext = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    progressRef.current = 0;
    setProgress(0);

    setCurrentPage((curr) => {
      if (curr < pages.length - 1) {
        trackEvent("page_complete", curr);
        const next = curr + 1;
        trackEvent("page_view", next);
        return next;
      } else {
        // Continuous auto-play loop: 1 to 10 then 1 to 10
        trackEvent("page_complete", curr);
        trackEvent("story_loop", 0);
        return 0;
      }
    });
  }, [pages.length, trackEvent]);

  const goPrev = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    progressRef.current = 0;
    setProgress(0);

    setCurrentPage((curr) => {
      if (curr > 0) {
        const prev = curr - 1;
        trackEvent("nav_prev", prev);
        return prev;
      }
      return 0;
    });
  }, [trackEvent]);

  // ─── 3-Zone Touch & Click Navigation (Left 30% = Prev, Right 30% = Next, Center 40% = Pause/Play)
  const handleZoneInteraction = useCallback((clientX: number) => {
    if (isMuted && !userMutedExplicitlyRef.current && activeAudioUrl) {
      attemptAutoPlayAudio();
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relativeX = clientX - rect.left;
    const ratio = relativeX / rect.width;

    if (ratio < 0.30) {
      // Left 30%: Previous Slide
      goPrev();
    } else if (ratio > 0.70) {
      // Right 30%: Next Slide
      goNext();
    } else {
      // Center 40%: Toggle Pause & Play
      setIsPaused((prev) => !prev);
    }
  }, [isMuted, activeAudioUrl, attemptAutoPlayAudio, goPrev, goNext]);

  const handleReplayStory = () => {
    cancelAnimationFrame(rafRef.current);
    progressRef.current = 0;
    setProgress(0);
    setIsCompleted(false);
    setCurrentPage(0);
    setIsPaused(false);
    trackEvent("page_view", 0, { action: "replay" });
  };

  // ─── 1. Auto Play & 2. Page Duration Progress Engine ──────────────────────
  useEffect(() => {
    if (isPaused || isHolding || isCompleted) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    // Reset progress on page entry if it was at 1
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
    }

    const startProgress = progressRef.current;
    startTimeRef.current = performance.now() - startProgress * duration;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      progressRef.current = p;
      setProgress(p);

      if (p >= 1) {
        cancelAnimationFrame(rafRef.current);
        progressRef.current = 0;
        setProgress(0);
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [currentPage, isPaused, isHolding, isCompleted, duration, goNext]);

  // ─── 12. Smart Multi-Slide & Next-Story Media Pre-buffering Engine ─────────
  // 1. High Priority Preload & GPU Decode for Immediate Next Slides (N+1, N+2)
  useEffect(() => {
    // Next Slide (N+1)
    if (currentPage < pages.length - 1) {
      const next1 = pages[currentPage + 1];
      const nextBg1 = next1?.elements.find((e) => e.type === "BACKGROUND");
      const nextSrc1 = (nextBg1?.content as any)?.src;
      if (nextSrc1) {
        const img1 = new window.Image();
        img1.src = nextSrc1;
        if ("decode" in img1) {
          img1.decode().catch(() => {});
        }
      }
    }
    // Following Slide (N+2)
    if (currentPage < pages.length - 2) {
      const next2 = pages[currentPage + 2];
      const nextBg2 = next2?.elements.find((e) => e.type === "BACKGROUND");
      const nextSrc2 = (nextBg2?.content as any)?.src;
      if (nextSrc2) {
        const img2 = new window.Image();
        img2.src = nextSrc2;
        if ("decode" in img2) {
          img2.decode().catch(() => {});
        }
      }
    }
  }, [currentPage, pages]);

  // 2. Comprehensive All-Slides Background Preloader & GPU Image Decoding
  useEffect(() => {
    const preloadAllStoryMedia = () => {
      pages.forEach((p, idx) => {
        if (idx === 0) return;
        const bgEl = p.elements.find((e) => e.type === "BACKGROUND");
        const src = (bgEl?.content as any)?.src;
        if (src) {
          const img = new window.Image();
          img.src = src;
          if ("decode" in img) {
            img.decode().catch(() => {});
          }
        }
      });
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(preloadAllStoryMedia);
      } else {
        const t = setTimeout(preloadAllStoryMedia, 500);
        return () => clearTimeout(t);
      }
    }
  }, [pages]);

  // 3. Next Story in Queue Buffer (Prefetch when reaching halfway or final slides)
  useEffect(() => {
    if (nextStory?.slug && currentPage >= Math.floor(pages.length / 2)) {
      router.prefetch(`/story/${nextStory.slug}`);
      if (nextStory.coverImage) {
        const nextStoryImg = new window.Image();
        nextStoryImg.src = nextStory.coverImage;
        if ("decode" in nextStoryImg) {
          nextStoryImg.decode().catch(() => {});
        }
      }
    }
  }, [currentPage, pages.length, nextStory, router]);

  // ─── 11. Background / Visibility API (Pause when Tab Hidden) ───────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ─── 13. Desktop Keyboard Controls ─────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, handleClose]);

  // ─── 6 & 7. Touch / Swipe & Press-and-Hold Gestures ────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    // 6. Press and hold pause trigger
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, 180);
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
      touchHandledRef.current = true;
      return;
    }

    // 7. Swipe down to close
    if (diffY > 80 && Math.abs(diffX) < 60) {
      handleClose();
      touchHandledRef.current = true;
      return;
    }

    // 7. Horizontal swipe
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) goNext();
      else goPrev();
      touchHandledRef.current = true;
      return;
    }

    // 3-Zone Tap Navigation (Left 30% = Prev, Right 30% = Next, Center 40% = Pause/Play)
    handleZoneInteraction(e.changedTouches[0].clientX);
    touchHandledRef.current = true;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If touched on mobile, touch handler already executed this interaction
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    handleZoneInteraction(e.clientX);
  };

  const handleMouseDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, 180);
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

  // ─── 10. Mute Toggle ───────────────────────────────────────────────────────
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      const nextMuted = !prev;
      userMutedExplicitlyRef.current = nextMuted;
      if (!nextMuted && audioRef.current && activeAudioUrl) {
        audioRef.current.play().catch(() => {});
      } else if (nextMuted && audioRef.current) {
        audioRef.current.pause();
      }
      return nextMuted;
    });
  };

  // ─── Share Handler ─────────────────────────────────────────────────────────
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent("share_click", currentPage);
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

  // ─── 17. CTA Click Handler ─────────────────────────────────────────────────
  const handleCtaClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    trackEvent("cta_click", currentPage, { url });
    if (url) {
      window.location.href = url;
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
  const locationDate = layoutMeta.locationDate || "WASHINGTON, D.C. · LIVE DISPATCH";
  const subheadText = layoutMeta.subheadText || "";
  const sourceText = layoutMeta.sourceText || "Source: Official Dispatch";
  const quoteAuthor = layoutMeta.quoteAuthor || "";
  const rankNumber = layoutMeta.rankNumber || `0${currentPage + 1}`;

  const hStyle = layoutMeta.headlineStyle || {};
  const dStyle = layoutMeta.descriptionStyle || {};
  const imgStyle = layoutMeta.imageStyle || {};

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
  const ctaUrl = (ctaElement?.content as any)?.url || "";
  const ctaLabel = (ctaElement?.content as any)?.label || "Swipe Up for Details";
  const hasCta = !!ctaElement && !!ctaUrl && ctaUrl.trim() !== "" && ctaUrl !== "#";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl select-none transition-all duration-150 ${
        isClosing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
      role="region"
      aria-label="Google Web Story Player"
    >
      {/* Outer Floating Desktop Close Button */}
      {showCloseButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClose();
          }}
          className="hidden md:flex fixed top-5 right-6 z-50 w-11 h-11 rounded-full bg-black/70 hover:bg-red-600 text-white border border-white/20 backdrop-blur-md items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close Story"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Desktop Navigation Chevrons */}
      {currentPage > 0 && (
        <button
          onClick={goPrev}
          className="hidden md:flex absolute left-6 lg:left-10 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all shadow-2xl hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentPage < pages.length - 1 && (
        <button
          onClick={goNext}
          className="hidden md:flex absolute right-6 lg:right-10 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all shadow-2xl hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* ─── 15. MOBILE SAFE AREA 9:16 CANVAS ──────────────────────────────── */}
      <div
        ref={containerRef}
        className="story-canvas relative z-20 overflow-hidden rounded-[32px] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col justify-between"
        style={{
          width: "min(100vw, calc(100vh * 9 / 16))",
          height: "min(100vh, calc(100vw * 16 / 9))",
          maxHeight: "94vh",
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={`Slide ${currentPage + 1} of ${pages.length}`}
      >
        {/* Base Background Color */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundColor: isLight
              ? "#f7f4ed"
              : layoutType === "infographic-stats-grid"
              ? "#070d1d"
              : bgColor,
          }}
        />

        {/* Background Image with Instant Rendering & Fallback & Ken Burns Animation */}
        {bgElement && (bgElement.content as any)?.src && layoutType !== "split-screen-card" && layoutType !== "polaroid-photo-frame" && (
          <div
            className={`absolute inset-0 overflow-hidden ${
              imgStyle.animation && imgStyle.animation !== "none" ? `story-anim-${imgStyle.animation}` : ""
            }`}
            style={{
              ["--story-duration" as any]: `${page.duration || 7}s`,
            }}
          >
            <Image
              src={(bgElement.content as any).src}
              alt={headingText || "Story Background"}
              fill
              sizes="(max-width: 768px) 100vw, 450px"
              className="object-cover"
              style={{
                transform: imgStyle.animation && imgStyle.animation !== "none" ? undefined : `scale(${imgStyle.scale || 1})`,
                objectPosition: imgStyle.objectPosition || "center",
                opacity: imgStyle.opacity !== undefined ? imgStyle.opacity : 0.9,
              }}
              priority={currentPage === 0}
              quality={85}
            />
          </div>
        )}

        {/* High-Contrast Scrim Overlay */}
        {layoutType !== "split-screen-card" && layoutType !== "polaroid-photo-frame" && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
        )}

        {/* ─── 3. SEGMENTED PROGRESS BARS (TOP SAFE ZONE) ───────────────────── */}
        <div className="relative z-30 pt-3.5 px-3.5 space-y-2 pointer-events-none">
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <div key={i} className="story-progress-bar flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
                <div
                  className={`story-progress-fill h-full rounded-full transition-transform ${
                    isLight ? "bg-slate-900" : "bg-white"
                  }`}
                  style={{
                    transform: `scaleX(${i < currentPage ? 1 : i === currentPage ? progress : 0})`,
                    transformOrigin: "left",
                    transitionDuration: "0ms",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Brand Header Bar & Controls (44px min hit targets) */}
          <div className="pt-1 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow ${
                  isLight ? "bg-slate-900 text-white" : "bg-white/20 text-white backdrop-blur-md"
                }`}
              >
                {publisherName[0]}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-black leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                  {publisherName}
                </span>
                <span className="text-[9px] font-semibold text-white/70">
                  {currentPage + 1} of {pages.length}
                </span>
              </div>
            </div>

            {/* Top Right Action Icons */}
            <div className="flex items-center gap-2">
              {/* 10. Mute / Unmute Button (ONLY when audio is actually attached) */}
              {activeAudioUrl && activeAudioUrl.trim() !== "" && (
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 flex items-center justify-center transition-colors shadow"
                  aria-label={isMuted ? "Unmute story" : "Mute story"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 flex items-center justify-center transition-colors shadow"
                aria-label="Share story"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* 14. Prominent Close (✕) Button */}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClose();
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/70 text-white border border-white/20 backdrop-blur-md hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition-all shadow-lg active:scale-90"
                  aria-label="Close Story Player"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── SLIDE CONTENT CONTAINER (SAFE ZONE ABOVE CTA) ────────────────── */}
        <div
          className={`relative z-20 flex-1 flex flex-col justify-between p-5 pt-3 overflow-y-auto hide-scrollbar ${
            hasCta ? "pb-24" : "pb-12"
          }`}
        >
          {/* 1. BREAKING BOLD */}
          {layoutType === "breaking-bold" && (
            <div className="flex flex-col justify-between h-full text-white">
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                  {badgeText}
                </span>
              </div>
              <div className="space-y-2.5 mt-auto">
                <h1
                  style={{
                    fontSize: `${hStyle.fontSize || 26}px`,
                    fontWeight: hStyle.fontWeight || "900",
                    fontStyle: hStyle.fontStyle || "normal",
                    textDecoration: hStyle.textDecoration || "none",
                    textAlign: hStyle.textAlign || "left",
                    color: hStyle.color || "#ffffff",
                    opacity: hStyle.opacity !== undefined ? hStyle.opacity : 1,
                  }}
                  className="leading-tight uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                >
                  {headingText}
                </h1>
                <p
                  style={{
                    fontSize: `${dStyle.fontSize || 13}px`,
                    fontWeight: dStyle.fontWeight || "normal",
                    fontStyle: dStyle.fontStyle || "normal",
                    textDecoration: dStyle.textDecoration || "none",
                    textAlign: dStyle.textAlign || "left",
                    color: dStyle.color || "#e2e8f0",
                    opacity: dStyle.opacity !== undefined ? dStyle.opacity : 1,
                  }}
                  className="leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-3"
                >
                  {descriptionText}
                </p>
                <div className="text-[10px] font-bold text-red-400 border-l-2 border-red-500 pl-2 uppercase tracking-wide">
                  {locationDate}
                </div>
              </div>
            </div>
          )}

          {/* 2. SPLIT SCREEN CARD */}
          {layoutType === "split-screen-card" && (
            <div className="flex flex-col justify-between h-full text-slate-900 bg-[#f7f4ed]">
              {bgElement && (bgElement.content as any)?.src && (
                <div className="relative w-full h-[45%] rounded-2xl overflow-hidden shadow-lg border border-slate-300">
                  <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
                </div>
              )}
              <div className="space-y-2.5 my-auto">
                <span className="inline-block px-3 py-1 rounded bg-slate-950 text-white font-black text-xs">
                  {badgeText}
                </span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-950 leading-tight">
                  {headingText}
                </h2>
                <div className="w-10 h-1 bg-red-600 rounded-full" />
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans line-clamp-4">
                  {descriptionText}
                </p>
              </div>
            </div>
          )}

          {/* 3. TOP RANK COUNTDOWN */}
          {layoutType === "top-rank-countdown" && (
            <div className="flex flex-col justify-between h-full text-white">
              <div className="absolute right-4 top-10 text-[130px] font-black text-white/10 font-mono select-none pointer-events-none leading-none">
                {rankNumber}
              </div>
              <div className="relative z-10 space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                  {badgeText}
                </span>
                <p className="text-xs font-bold text-amber-400">{subheadText}</p>
              </div>
              {bgElement && (bgElement.content as any)?.src && (
                <div className="relative z-10 w-full h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 my-auto">
                  <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
                </div>
              )}
              <div className="relative z-10 space-y-1.5 mt-auto">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow">
                  {headingText}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {descriptionText}
                </p>
              </div>
            </div>
          )}

          {/* 4. GLASSMORPHISM FLOATING CARD */}
          {layoutType === "glassmorphism-card" && (
            <div className="flex flex-col justify-center h-full text-white">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3">
                <span className="inline-block px-3 py-1 rounded bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                  {badgeText}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow">
                  {headingText}
                </h2>
                <p className="text-xs text-cyan-300 font-mono font-bold">{subheadText}</p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {descriptionText}
                </p>
              </div>
            </div>
          )}

          {/* 5. POLAROID RETRO FRAME */}
          {layoutType === "polaroid-photo-frame" && (
            <div className="flex flex-col justify-between h-full text-slate-900 bg-[#f4ede4]">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-blue-600 text-white font-bold text-xs uppercase">
                  {badgeText}
                </span>
                <h2 className="font-serif font-black text-lg text-slate-950 leading-tight">
                  {headingText}
                </h2>
              </div>
              <div className="relative my-auto bg-white p-3 pb-7 rounded-xl shadow-2xl border border-slate-300/80 rotate-[-2deg]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-200/80 rounded-sm shadow-sm rotate-[4deg]" />
                <div className="relative w-full h-40 rounded overflow-hidden">
                  {bgElement && (bgElement.content as any)?.src && (
                    <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" priority />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono text-center mt-2">
                  {locationDate}
                </p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{descriptionText}</p>
            </div>
          )}

          {/* 6. INFOGRAPHIC STATS GRID */}
          {layoutType === "infographic-stats-grid" && (
            <div className="flex flex-col justify-between h-full text-white bg-[#070d1d]">
              <div className="pt-2 space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                  {badgeText}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {headingText}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 my-auto">
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
                    <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 backdrop-blur-sm">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[idx % colors.length]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-base font-black text-white">{item.stat}</div>
                      <p className="text-xs text-slate-300 font-bold truncate">{item.label}</p>
                      <p className="text-[9px] text-slate-400">{item.subtext}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-400 text-center">{sourceText}</p>
            </div>
          )}

          {/* 7. CONNECTED TIMELINE */}
          {layoutType === "connected-timeline" && (
            <div className="flex flex-col justify-between h-full text-white bg-[#0d0f15]">
              <div className="pt-2 space-y-1">
                <span className="px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow w-max">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE UPDATE
                </span>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-1">
                  {headingText}
                </h2>
              </div>
              <div className="border-l-2 border-red-600 pl-4 space-y-3.5 my-auto">
                {timelineList.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-[#0d0f15]" />
                    <span className="text-xs font-black text-red-400 block">{item.time}</span>
                    <p className="text-xs text-slate-200 leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">{locationDate}</p>
            </div>
          )}

          {/* 8. BIG QUOTE SPOTLIGHT */}
          {layoutType === "big-quote-spotlight" && (
            <div className="flex flex-col justify-between h-full text-white text-center">
              <span className="text-5xl text-amber-400 font-serif leading-none">“</span>
              <div className="space-y-3 my-auto">
                {bgElement && (bgElement.content as any)?.src && (
                  <div className="relative w-18 h-18 rounded-full overflow-hidden mx-auto ring-4 ring-amber-400/40 shadow-2xl">
                    <Image src={(bgElement.content as any).src} alt="" fill className="object-cover" />
                  </div>
                )}
                <blockquote className="font-serif italic text-lg sm:text-xl font-bold text-white px-2 leading-relaxed">
                  {headingText}
                </blockquote>
                <cite className="text-xs font-black text-amber-400 uppercase tracking-widest block not-italic">
                  — {quoteAuthor || "Senior Columnist"}
                </cite>
              </div>
              <p className="text-xs text-slate-400 pb-1">{descriptionText}</p>
            </div>
          )}

          {/* 9. VERSUS COMPARISON */}
          {layoutType === "versus-comparison" && (
            <div className="flex flex-col justify-between h-full text-white">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow">
                  {badgeText || "HEAD-TO-HEAD"}
                </span>
                <h2 className="text-base sm:text-lg font-black mt-1">{headingText}</h2>
              </div>
              <div className="relative space-y-2.5 my-auto">
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-300">Quantum Neural</span>
                    <span className="text-base font-black text-cyan-400">100 TOPS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">5W Ultra-Low Power · 0ms Cloud Latency</p>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-2 border-black shadow-2xl">
                  VS
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-300">Legacy GPU</span>
                    <span className="text-base font-black text-purple-400">45 TOPS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">35W High Power · Cloud Delay Required</p>
                </div>
              </div>
            </div>
          )}

          {/* 10. MAGAZINE EDITORIAL CUTOUT */}
          {layoutType === "magazine-cutout" && (
            <div className="flex flex-col justify-between h-full text-white">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-purple-600 text-white font-black text-xs uppercase tracking-wider shadow">
                  {badgeText}
                </span>
                <h1 className="font-serif font-black text-3xl sm:text-4xl text-white leading-none mt-1">
                  {headingText}
                </h1>
                <p className="font-serif italic text-xs text-pink-400 font-bold">{subheadText}</p>
              </div>
              <div className="space-y-2 mt-auto">
                <p className="text-xs text-slate-200 line-clamp-3 leading-snug drop-shadow">
                  {descriptionText}
                </p>
              </div>
            </div>
          )}

          {/* 11. RECIPE & STEP CHECKLIST */}
          {layoutType === "recipe-step-card" && (
            <div className="flex flex-col justify-between h-full text-amber-100 bg-[#160d09]">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow">
                  {badgeText}
                </span>
                <h2 className="font-serif font-bold text-lg text-white mt-1">{headingText}</h2>
              </div>
              <div className="space-y-2 my-auto">
                {[
                  { num: "01", text: "Boil fresh pasta 90 seconds in salted water." },
                  { num: "02", text: "Swirl French butter with starchy water to form emulsion." },
                  { num: "03", text: "Plate immediately and finish with shaved Alba truffles." },
                ].map((st, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                      {st.num}
                    </span>
                    <span className="text-xs text-slate-200">{st.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. SPORTS SCOREBOARD */}
          {layoutType === "sports-scoreboard" && (
            <div className="flex flex-col justify-between h-full text-white bg-[#0a0d18]">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-2xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider block text-white/80">FINALS GAME 7</span>
                  <span className="text-base font-black font-mono">LAL 114</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-black">OT FINAL</span>
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-wider block text-white/80">EAST</span>
                  <span className="text-base font-black font-mono">108 BOS</span>
                </div>
              </div>
              <div className="space-y-2 mt-auto">
                <h2 className="text-sm font-black text-white">{headingText}</h2>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-white/10 rounded-xl text-center">
                    <span className="text-base font-black text-orange-400 block">44</span>
                    <span className="text-[8px] uppercase text-slate-400 font-bold">PTS</span>
                  </div>
                  <div className="flex-1 p-2 bg-white/10 rounded-xl text-center">
                    <span className="text-base font-black text-orange-400 block">12</span>
                    <span className="text-[8px] uppercase text-slate-400 font-bold">REB</span>
                  </div>
                  <div className="flex-1 p-2 bg-white/10 rounded-xl text-center">
                    <span className="text-base font-black text-orange-400 block">8</span>
                    <span className="text-[8px] uppercase text-slate-400 font-bold">AST</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 17. DEDICATED BOTTOM CTA BAR (ONLY IF EXPLICITLY CONFIGURED) ────── */}
        {hasCta && (
          <div
            className="absolute bottom-5 inset-x-5 z-30 pointer-events-auto"
            onClick={(e) => handleCtaClick(e, ctaUrl)}
          >
            <div className="w-full py-3 px-5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer">
              <span>{ctaLabel || "Learn More"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* ─── 6. CENTER PAUSE / PLAY INDICATOR ──────────────────────────────── */}
        {(isPaused || isHolding) && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl animate-fade-in">
              {isHolding ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </div>
          </div>
        )}

        {/* ─── 8 & 9. STORY COMPLETED & REPLAY / NEXT STORY OVERLAY ─────────── */}
        {isCompleted && (
          <div
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-fade-in select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Story Completed
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Story Recap & Replay */}
            <div className="text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <h3 className="text-lg font-black">{title}</h3>
                <p className="text-xs text-slate-400">By {authorName} · {publisherName}</p>
              </div>

              <button
                type="button"
                onClick={handleReplayStory}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all hover:scale-105"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Story</span>
              </button>
            </div>

            {/* 9. Next Story Card */}
            {nextStory ? (
              <div
                onClick={() => {
                  trackEvent("next_story_click", currentPage, { nextSlug: nextStory.slug });
                  router.push(`/story/${nextStory.slug}`);
                }}
                className="cursor-pointer p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all group flex items-center justify-between"
              >
                <div className="space-y-1 max-w-[200px]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
                    Up Next · {nextStory.categoryName || "Visual Story"}
                  </span>
                  <h4 className="text-xs font-black truncate group-hover:text-red-400 transition-colors">
                    {nextStory.title}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs text-center transition-colors"
              >
                Explore More Stories
              </button>
            )}
          </div>
        )}

        {/* Copy Toast */}
        {copied && (
          <div className="absolute top-16 inset-x-0 z-40 flex justify-center pointer-events-none animate-fade-in">
            <span className="px-4 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-white/20">
              Link copied to clipboard!
            </span>
          </div>
        )}

        {/* Background Audio Player */}
        {activeAudioUrl && (
          <audio
            ref={audioRef}
            src={activeAudioUrl}
            loop
            preload="auto"
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}
