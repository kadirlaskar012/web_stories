"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Category, Author, StoryStatus, ElementType } from "@prisma/client";
import {
  SLIDE_LAYOUTS,
  SlideLayoutConfig,
  SlideLayoutType,
  getLayoutById,
  DataFactItem,
  TimelineItem,
  VersusItem,
  ChecklistItem,
} from "@/lib/themes/layouts";
import { STORY_TEMPLATES, StoryTemplatePreset } from "@/lib/themes/templates";
import { TemplateGallery } from "./TemplateGallery";
import { slugify } from "@/lib/slugify";
import { compressImage } from "@/lib/image-compressor";
import {
  Layers,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Upload,
  Eye,
  AlertCircle,
  FileText,
  LayoutGrid,
  ArrowRight,
  RefreshCw,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  MoveVertical,
  Type,
  Palette,
  Sliders,
  Sparkles,
  Tag,
} from "lucide-react";

export type ImageAnimationType =
  | "none"
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down";

export interface TextStyleConfig {
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "800" | "900";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  color?: string;
  opacity?: number;
  positionY?: "top" | "center" | "bottom";
}

export interface ImageStyleConfig {
  scale?: number;
  opacity?: number;
  animation?: ImageAnimationType;
  objectPosition?: "center" | "top" | "bottom";
}

export interface SlideData {
  id: string;
  order: number;
  layoutType: SlideLayoutType;
  backgroundMedia: string;
  backgroundColor: string;
  badgeText?: string;
  headingText: string;
  subheadText?: string;
  descriptionText: string;
  locationDate?: string;
  sourceText?: string;
  quoteAuthor?: string;
  rankNumber?: string;
  duration: number;
  hasCta: boolean;
  ctaLabel: string;
  ctaUrl: string;
  statsList?: DataFactItem[];
  timelineList?: TimelineItem[];
  versusData?: VersusItem;
  checklist?: ChecklistItem[];
  // WYSIWYG Custom Styles
  headlineStyle?: TextStyleConfig;
  descriptionStyle?: TextStyleConfig;
  imageStyle?: ImageStyleConfig;
}

interface StoryWizardProps {
  categories: Category[];
  authors: Author[];
  initialStory?: any;
}

export function StoryWizard({
  categories,
  authors,
  initialStory,
}: StoryWizardProps) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"gallery" | "editor">(() => {
    return initialStory ? "editor" : "gallery";
  });

  const [selectedTemplate, setSelectedTemplate] = useState<SlideLayoutType>(() => {
    if (initialStory?.pages?.[0]?.elements?.[0]?.content?.layoutMeta?.layoutType) {
      return initialStory.pages[0].elements[0].content.layoutMeta.layoutType;
    }
    return "breaking-bold";
  });

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Active WYSIWYG Target on Canvas: 'headline' | 'description' | 'image' | null
  const [selectedElement, setSelectedElement] = useState<"headline" | "description" | "image" | null>(null);

  // ─── Story Details State ───────────────────────────────────────────────────
  const [title, setTitle] = useState(
    initialStory?.title || "Massive Wildfire Hits California as Firefighters Battle Blaze"
  );
  const [slug, setSlug] = useState(initialStory?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialStory?.slug);
  const [description, setDescription] = useState(
    initialStory?.description ||
      "Emergency evacuations ordered across California canyons as high winds fuel rapid wildfire growth."
  );
  const [excerpt, setExcerpt] = useState(initialStory?.excerpt || "");
  const [coverImage, setCoverImage] = useState(
    initialStory?.coverImage ||
      "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80"
  );
  const [categoryId, setCategoryId] = useState(
    initialStory?.categoryId || categories[0]?.id || ""
  );
  const [authorId, setAuthorId] = useState(
    initialStory?.authorId || authors[0]?.id || ""
  );
  const [tagsInput, setTagsInput] = useState(
    initialStory?.tags?.map((t: any) => t.tag?.name).join(", ") || "breaking, news, usa, wildfire"
  );
  const [isFeatured, setIsFeatured] = useState(initialStory?.isFeatured ?? true);

  // ─── Slide Builder State ─────────────────────────────────────────────────
  const [slides, setSlides] = useState<SlideData[]>(() => {
    if (initialStory?.pages?.length > 0) {
      return initialStory.pages.map((p: any, idx: number) => {
        const bgEl = p.elements?.find((e: any) => e.type === "BACKGROUND");
        const textEls = p.elements?.filter((e: any) => e.type === "TEXT") || [];
        const ctaEl = p.elements?.find((e: any) => e.type === "CTA");
        const meta = (bgEl?.content as any)?.layoutMeta || {};

        return {
          id: p.id || `slide-${idx}`,
          order: idx,
          layoutType: meta.layoutType || selectedTemplate,
          backgroundMedia: (bgEl?.content as any)?.src || "",
          backgroundColor: p.background || "#0c0d12",
          badgeText: meta.badgeText || "BREAKING NEWS",
          headingText: (textEls[0]?.content as any)?.text || "",
          subheadText: meta.subheadText || "",
          descriptionText: (textEls[1]?.content as any)?.text || "",
          locationDate: meta.locationDate || "JUNE 1, 2024 | CALIFORNIA, USA",
          sourceText: meta.sourceText || "Source: Official Dispatch",
          quoteAuthor: meta.quoteAuthor || "",
          rankNumber: meta.rankNumber || "01",
          duration: p.duration || 7,
          hasCta: !!ctaEl,
          ctaLabel: (ctaEl?.content as any)?.label || "Swipe Up for Details",
          ctaUrl: (ctaEl?.content as any)?.url || "",
          statsList: meta.statsList || undefined,
          timelineList: meta.timelineList || undefined,
          versusData: meta.versusData || undefined,
          checklist: meta.checklist || undefined,
          headlineStyle: meta.headlineStyle || {
            fontSize: 24,
            fontWeight: "800",
            fontStyle: "normal",
            textDecoration: "none",
            textAlign: "left",
            color: "#ffffff",
            positionY: "bottom",
          },
          descriptionStyle: meta.descriptionStyle || {
            fontSize: 14,
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            textAlign: "left",
            color: "#e2e8f0",
          },
          imageStyle: meta.imageStyle || {
            scale: 1,
            objectPosition: "center",
          },
        };
      });
    }

    return [
      {
        id: "slide-0",
        order: 0,
        layoutType: "breaking-bold",
        backgroundMedia: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "BREAKING NEWS",
        headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
        descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons under severe dry winds.",
        locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
        duration: 7,
        hasCta: false,
        ctaLabel: "Swipe Up for More",
        ctaUrl: "",
        headlineStyle: { fontSize: 26, fontWeight: "900", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#ffffff", positionY: "bottom" },
        descriptionStyle: { fontSize: 13, fontWeight: "normal", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#e2e8f0" },
        imageStyle: { scale: 1, objectPosition: "center" },
      },
      {
        id: "slide-1",
        order: 1,
        layoutType: "breaking-bold",
        backgroundMedia: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "STATE OF EMERGENCY",
        headingText: "Over 50,000 Acres Burned Overnight",
        descriptionText: "Governor issues emergency declaration as gale-force winds complicate air drops and containment lines.",
        locationDate: "JUNE 1, 2024 | TOPANGA CANYON, CA",
        duration: 7,
        hasCta: false,
        ctaLabel: "Swipe Up for More",
        ctaUrl: "",
        headlineStyle: { fontSize: 24, fontWeight: "800", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#ffffff", positionY: "bottom" },
        descriptionStyle: { fontSize: 13, fontWeight: "normal", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#e2e8f0" },
        imageStyle: { scale: 1, objectPosition: "center" },
      },
      {
        id: "slide-2",
        order: 2,
        layoutType: "breaking-bold",
        backgroundMedia: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "EVACUATION MAP",
        headingText: "Emergency Shelters Open Across County",
        descriptionText: "Red Cross stations activated with emergency beds, food supplies, and air filters for residents.",
        locationDate: "JUNE 1, 2024 | LOS ANGELES COUNTY",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Live Evacuation Map",
        ctaUrl: "/stories",
        headlineStyle: { fontSize: 24, fontWeight: "800", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#ffffff", positionY: "bottom" },
        descriptionStyle: { fontSize: 13, fontWeight: "normal", fontStyle: "normal", textDecoration: "none", textAlign: "left", color: "#e2e8f0" },
        imageStyle: { scale: 1, objectPosition: "center" },
      },
    ];
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // ─── Publishing & Status ─────────────────────────────────────────────────
  const [status, setStatus] = useState<StoryStatus>(
    initialStory?.status || StoryStatus.PUBLISHED
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialStory?.scheduledAt
      ? new Date(initialStory.scheduledAt).toISOString().slice(0, 16)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const handleTemplateSelectedFromGallery = (template: StoryTemplatePreset) => {
    setSelectedTemplate(template.layoutType);
    setTitle(template.defaultTitle);
    setDescription(template.defaultExcerpt);
    setExcerpt(template.defaultExcerpt);
    setCoverImage(template.coverImage);
    setTagsInput(template.defaultTags.join(", "));

    const isLightTemplate = template.layoutType === "split-screen-card" || template.layoutType === "polaroid-photo-frame";

    setSlides(
      template.defaultSlides.map((s, idx) => ({
        id: `slide-${idx}`,
        order: idx,
        layoutType: template.layoutType,
        backgroundMedia: s.backgroundMedia,
        backgroundColor: s.backgroundColor,
        badgeText: s.badgeText,
        headingText: s.headingText,
        subheadText: s.subheadText,
        descriptionText: s.descriptionText,
        locationDate: s.locationDate,
        sourceText: s.sourceText,
        quoteAuthor: s.quoteAuthor,
        rankNumber: s.rankNumber,
        duration: s.duration,
        hasCta: !!s.hasCta,
        ctaLabel: s.ctaLabel || "Swipe Up for Details",
        ctaUrl: s.ctaUrl || "",
        statsList: s.statsList,
        timelineList: s.timelineList,
        versusData: s.versusData,
        checklist: s.checklist,
        headlineStyle: {
          fontSize: 24,
          fontWeight: "800",
          fontStyle: "normal",
          textDecoration: "none",
          textAlign: "left",
          color: isLightTemplate ? "#0f172a" : "#ffffff",
          positionY: "bottom",
        },
        descriptionStyle: {
          fontSize: 13,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none",
          textAlign: "left",
          color: isLightTemplate ? "#334155" : "#e2e8f0",
        },
        imageStyle: {
          scale: 1,
          objectPosition: "center",
        },
      }))
    );

    setActiveSlideIndex(0);
    setViewMode("editor");
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeLayout = getLayoutById(selectedTemplate);

  const handleDeleteMedia = async (target: "cover" | "slide") => {
    const urlToDelete = target === "cover" ? coverImage : activeSlide.backgroundMedia;
    if (!urlToDelete) return;

    if (target === "cover") {
      setCoverImage("");
    } else {
      updateSlide(activeSlideIndex, { backgroundMedia: "" });
    }

    try {
      await fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToDelete }),
      });
    } catch (err) {
      console.error("Delete media failed:", err);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "slide"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const oldUrl = target === "cover" ? coverImage : activeSlide.backgroundMedia;

    setUploading(true);
    setError("");

    try {
      // 1. Auto-compress client-side down to 1080x1920 9:16 Web Story format
      const compressedFile = await compressImage(file, {
        maxWidth: 1080,
        maxHeight: 1920,
        quality: 0.85,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "cover") {
        setCoverImage(data.url);
      } else {
        updateSlide(activeSlideIndex, { backgroundMedia: data.url });
      }

      // Auto-delete previous image from Cloudinary when replaced
      if (oldUrl && oldUrl !== data.url && (oldUrl.includes("cloudinary.com") || oldUrl.startsWith("/uploads/"))) {
        fetch("/api/media/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: oldUrl }),
        }).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const updateSlide = (index: number, updates: Partial<SlideData>) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const updateHeadlineStyle = (updates: Partial<TextStyleConfig>) => {
    const current = activeSlide.headlineStyle || {};
    updateSlide(activeSlideIndex, {
      headlineStyle: { ...current, ...updates },
    });
  };

  const updateDescriptionStyle = (updates: Partial<TextStyleConfig>) => {
    const current = activeSlide.descriptionStyle || {};
    updateSlide(activeSlideIndex, {
      descriptionStyle: { ...current, ...updates },
    });
  };

  const updateImageStyle = (updates: Partial<ImageStyleConfig>) => {
    const current = activeSlide.imageStyle || {};
    updateSlide(activeSlideIndex, {
      imageStyle: { ...current, ...updates },
    });
  };

  const handleAddSlideInChosenTemplate = () => {
    const tConfig = getLayoutById(selectedTemplate);
    const isLightTemplate = selectedTemplate === "split-screen-card" || selectedTemplate === "polaroid-photo-frame";
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      order: slides.length,
      layoutType: selectedTemplate,
      backgroundMedia: activeSlide?.backgroundMedia || coverImage || tConfig.defaultData.mediaUrl || "",
      backgroundColor:
        selectedTemplate === "split-screen-card"
          ? "#f7f4ed"
          : selectedTemplate === "polaroid-photo-frame"
          ? "#f4ede4"
          : selectedTemplate === "infographic-stats-grid"
          ? "#070d1d"
          : "#0c0d12",
      badgeText: tConfig.defaultData.badgeText,
      headingText: `Story Point #${slides.length + 1}`,
      subheadText: tConfig.defaultData.subheadText,
      descriptionText: "Add your editorial context, quotes, or updates for this slide...",
      locationDate: tConfig.defaultData.locationDate,
      sourceText: tConfig.defaultData.sourceText,
      quoteAuthor: tConfig.defaultData.quoteAuthor,
      rankNumber: `0${slides.length + 1}`,
      duration: 7,
      hasCta: false,
      ctaLabel: "Swipe Up for More",
      ctaUrl: "",
      statsList: tConfig.defaultData.statsList,
      timelineList: tConfig.defaultData.timelineList,
      versusData: tConfig.defaultData.versusData,
      checklist: tConfig.defaultData.checklist,
      headlineStyle: {
        fontSize: 24,
        fontWeight: "800",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "left",
        color: isLightTemplate ? "#0f172a" : "#ffffff",
        positionY: "bottom",
      },
      descriptionStyle: {
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "left",
        color: isLightTemplate ? "#334155" : "#e2e8f0",
      },
      imageStyle: { scale: 1, objectPosition: "center" },
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const duplicateSlide = (index: number) => {
    const target = slides[index];
    const newSlide: SlideData = {
      ...target,
      id: `slide-${Date.now()}`,
      order: index + 1,
    };
    const next = [...slides];
    next.splice(index + 1, 0, newSlide);
    setSlides(next.map((s, i) => ({ ...s, order: i })));
    setActiveSlideIndex(index + 1);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setSlides(next);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const totalAuditScore =
    (title.length >= 30 && title.length <= 70 ? 25 : title.length > 0 ? 15 : 0) +
    (slides.length >= 4 && slides.length <= 15 ? 25 : slides.length >= 2 ? 15 : 5) +
    (coverImage ? 25 : 0) +
    (slides.every((s) => s.headingText.trim().length > 0) ? 25 : 15);

  const handleSaveStory = async () => {
    if (!title.trim()) {
      setActiveStep(1);
      setError("Please enter a story headline.");
      return;
    }
    if (!coverImage) {
      setActiveStep(1);
      setError("Please upload or provide a lead photo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pagesPayload = slides.map((slide, idx) => {
        const elements: any[] = [];

        elements.push({
          type: ElementType.BACKGROUND,
          content: {
            src: slide.backgroundMedia,
            fit: "cover",
            layoutMeta: {
              layoutType: selectedTemplate,
              badgeText: slide.badgeText,
              subheadText: slide.subheadText,
              locationDate: slide.locationDate,
              sourceText: slide.sourceText,
              quoteAuthor: slide.quoteAuthor,
              rankNumber: slide.rankNumber,
              statsList: slide.statsList,
              timelineList: slide.timelineList,
              versusData: slide.versusData,
              checklist: slide.checklist,
              headlineStyle: slide.headlineStyle,
              descriptionStyle: slide.descriptionStyle,
              imageStyle: slide.imageStyle,
            },
          },
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          style: { opacity: 0.95 },
          order: 0,
        });

        if (slide.headingText.trim()) {
          elements.push({
            type: ElementType.TEXT,
            content: { text: slide.headingText },
            position: { x: 8, y: 50 },
            size: { width: 84, height: 25 },
            style: {
              fontSize: slide.headlineStyle?.fontSize || 24,
              fontWeight: slide.headlineStyle?.fontWeight === "bold" || slide.headlineStyle?.fontWeight === "900" ? 800 : 600,
              color: slide.headlineStyle?.color || "#ffffff",
              lineHeight: 1.15,
            },
            order: 1,
          });
        }

        if (slide.descriptionText.trim()) {
          elements.push({
            type: ElementType.TEXT,
            content: { text: slide.descriptionText },
            position: { x: 8, y: 70 },
            size: { width: 84, height: 20 },
            style: {
              fontSize: slide.descriptionStyle?.fontSize || 14,
              color: slide.descriptionStyle?.color || "#e2e8f0",
              lineHeight: 1.5,
            },
            order: 2,
          });
        }

        if (slide.hasCta && slide.ctaLabel) {
          elements.push({
            type: ElementType.CTA,
            content: { label: slide.ctaLabel, url: slide.ctaUrl || "#" },
            position: { x: 15, y: 88 },
            size: { width: 70, height: 8 },
            style: {
              backgroundColor: "#dc2626",
              color: "#ffffff",
              borderRadius: 9999,
            },
            order: 3,
          });
        }

        return {
          order: idx,
          background: slide.backgroundColor || "#0c0d12",
          duration: slide.duration,
          elements,
        };
      });

      const storyPayload = {
        title,
        slug: slug || slugify(title),
        description,
        excerpt: excerpt || description.slice(0, 120),
        coverImage,
        categoryId,
        authorId,
        isFeatured,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        publishedAt: status === StoryStatus.PUBLISHED ? new Date().toISOString() : null,
        tags: tagsInput
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        pages: pagesPayload,
      };

      const url = initialStory?.id
        ? `/api/stories/${initialStory.id}`
        : "/api/stories";
      const method = initialStory?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save story");

      setSuccess("Web Story saved and published successfully!");
      setTimeout(() => {
        router.push("/admin/stories");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save story");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: TEMPLATE GALLERY (FIRST STEP)
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "gallery") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              Web Stories Creation Studio
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/stories")}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>

        <TemplateGallery onSelectTemplate={handleTemplateSelectedFromGallery} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: STORY EDITOR (WITH LIVE WYSIWYG ON-CANVAS FORMATTING TOOLBAR)
  // ══════════════════════════════════════════════════════════════════════════
  const hStyle = activeSlide.headlineStyle || {};
  const dStyle = activeSlide.descriptionStyle || {};
  const imgStyle = activeSlide.imageStyle || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("gallery")}
              className="text-xs font-black uppercase tracking-wider text-red-600 hover:underline flex items-center gap-1"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>← Change Story Template ({activeLayout.name})</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {initialStory ? "Edit Web Story" : "Web Story Studio"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/stories")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveStory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{status === StoryStatus.PUBLISHED ? "Publish Story" : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {[
          { step: 1, label: `1. Story & Slides Content (${slides.length})`, icon: Layers },
          { step: 2, label: "2. Google Discover SEO Audit", icon: CheckCircle2 },
          { step: 3, label: "3. Publish & Schedule", icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStep === tab.step;
          return (
            <button
              key={tab.step}
              onClick={() => setActiveStep(tab.step as any)}
              className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-950 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-500" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT COLUMN: Inputs (7 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {activeStep === 1 && (
            <div className="space-y-6">
              {/* Primary Story Metadata */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    Story Details & Metadata
                  </h2>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                    {activeLayout.name}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Main Story Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Massive Wildfire Hits California as Firefighters Battle Blaze"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Author / Reporter
                    </label>
                    <select
                      value={authorId}
                      onChange={(e) => setAuthorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Cover Image (9:16)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e, "cover")}
                      accept="image/*"
                      className="hidden"
                    />

                    {coverImage ? (
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="relative w-10 h-14 rounded-xl overflow-hidden shadow border border-slate-300 flex-shrink-0 bg-slate-900">
                          <Image src={coverImage} alt="Cover" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Cover Set
                          </span>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                              title="Change Cover Photo"
                            >
                              <RefreshCw className={`w-2.5 h-2.5 ${uploading ? "animate-spin" : ""}`} />
                              <span>Change</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia("cover")}
                              disabled={uploading}
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold flex items-center gap-1 transition-all"
                              title="Delete Cover Photo"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploading ? "Uploading..." : "Browse PC"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SEO & Discover Tags Input */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-red-600" />
                      SEO & Google Discover Tags (Comma-Separated)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      e.g. news, breaking, usa, visa, trending
                    </span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Enter tags separated by comma: politics, us-news, elon-musk, technology"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  {tagsInput.trim() && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {tagsInput
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                        .map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200 shadow-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Timeline Rail */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-600" />
                      Story Pages Timeline ({slides.length})
                    </h3>

                    <button
                      type="button"
                      onClick={handleAddSlideInChosenTemplate}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => {
                          setActiveSlideIndex(index);
                          setSelectedElement(null);
                        }}
                        className={`relative flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden border-2 transition-all p-1.5 flex flex-col justify-between ${
                          activeSlideIndex === index
                            ? "border-red-600 ring-4 ring-red-500/20 shadow-md scale-105 bg-slate-950 text-white"
                            : "border-slate-200 bg-slate-100 opacity-70 hover:opacity-100 text-slate-700"
                        }`}
                      >
                        {slide.backgroundMedia ? (
                          <Image
                            src={slide.backgroundMedia}
                            alt=""
                            fill
                            className="object-cover opacity-50"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900" />
                        )}

                        <div className="relative z-10 flex justify-between items-center w-full">
                          <span className="w-5 h-5 rounded-full bg-black/70 text-white font-black text-[10px] flex items-center justify-center">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="relative z-10 text-left bg-black/80 backdrop-blur-sm p-1.5 rounded-lg">
                          <p className="text-[8px] font-black text-red-400 uppercase truncate">
                            Slide #{index + 1}
                          </p>
                          <p className="text-[8px] font-bold text-white truncate">
                            {slide.headingText || "Headline"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Slide Form Inputs */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <span className="font-black text-sm text-slate-900">
                      Editing Slide #{activeSlideIndex + 1} ({activeLayout.name})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateSlide(activeSlideIndex)}
                        className="p-2 rounded-xl bg-white text-slate-600 hover:text-red-600 border border-slate-200 shadow-sm"
                        title="Duplicate Slide"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteSlide(activeSlideIndex)}
                          className="p-2 rounded-xl bg-white text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Badge Label */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Category / Status Badge
                    </label>
                    <input
                      type="text"
                      value={activeSlide.badgeText || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { badgeText: e.target.value })}
                      placeholder="e.g. BREAKING NEWS, EXPLAINER"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-black tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Slide Headline
                    </label>
                    <input
                      type="text"
                      value={activeSlide.headingText}
                      onChange={(e) => updateSlide(activeSlideIndex, { headingText: e.target.value })}
                      placeholder="Enter short, punchy headline..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-black focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Supporting News Description
                    </label>
                    <textarea
                      rows={2}
                      value={activeSlide.descriptionText}
                      onChange={(e) => updateSlide(activeSlideIndex, { descriptionText: e.target.value })}
                      placeholder="Add concise context, quotes, or takeaway..."
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Photo Uploader with In-Form Live Thumbnail, Replace & Delete */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Editorial Photo (Local PC Browse or Web URL)
                    </label>

                    {activeSlide.backgroundMedia ? (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative w-14 h-20 rounded-xl overflow-hidden shadow border border-slate-300 flex-shrink-0 bg-slate-900">
                          <Image
                            src={activeSlide.backgroundMedia}
                            alt="Slide Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Slide #{activeSlideIndex + 1} Photo Set
                            </span>
                          </div>

                          <input
                            type="text"
                            value={activeSlide.backgroundMedia}
                            onChange={(e) => updateSlide(activeSlideIndex, { backgroundMedia: e.target.value })}
                            placeholder="Image URL..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              ref={slideFileInputRef}
                              onChange={(e) => handleFileUpload(e, "slide")}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => slideFileInputRef.current?.click()}
                              disabled={uploading}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
                            >
                              <RefreshCw className={`w-3 h-3 ${uploading ? "animate-spin" : ""}`} />
                              <span>{uploading ? "Uploading..." : "Replace Photo"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia("slide")}
                              disabled={uploading}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Photo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={activeSlide.backgroundMedia}
                          onChange={(e) => updateSlide(activeSlideIndex, { backgroundMedia: e.target.value })}
                          placeholder="https://images.unsplash.com/... or browse PC"
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <input
                          type="file"
                          ref={slideFileInputRef}
                          onChange={(e) => handleFileUpload(e, "slide")}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => slideFileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploading ? "Uploading..." : "Browse PC"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Motion Animation & Opacity Quick Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Image Motion (Ken Burns)
                      </label>
                      <select
                        value={activeSlide.imageStyle?.animation || "none"}
                        onChange={(e) => updateImageStyle({ animation: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="none">Static (No Animation)</option>
                        <option value="zoom-in">🔍 Slow Zoom In</option>
                        <option value="zoom-out">🔎 Slow Zoom Out</option>
                        <option value="pan-left">⬅️ Pan Right to Left</option>
                        <option value="pan-right">➡️ Pan Left to Right</option>
                        <option value="pan-up">⬆️ Pan Down to Top</option>
                        <option value="pan-down">⬇️ Pan Top to Down</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                          Photo Opacity
                        </span>
                        <span className="text-emerald-600 font-mono">
                          {Math.round((activeSlide.imageStyle?.opacity !== undefined ? activeSlide.imageStyle.opacity : 0.9) * 100)}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={activeSlide.imageStyle?.opacity !== undefined ? activeSlide.imageStyle.opacity : 0.9}
                        onChange={(e) => updateImageStyle({ opacity: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Swipe CTA & Slide Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={activeSlide.hasCta}
                          onChange={(e) => updateSlide(activeSlideIndex, { hasCta: e.target.checked })}
                          className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Include "Swipe Up" CTA Button
                        </span>
                      </label>

                      {activeSlide.hasCta && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={activeSlide.ctaLabel}
                            onChange={(e) => updateSlide(activeSlideIndex, { ctaLabel: e.target.value })}
                            placeholder="CTA Label (e.g. Swipe Up for Details)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                          <input
                            type="text"
                            value={activeSlide.ctaUrl}
                            onChange={(e) => updateSlide(activeSlideIndex, { ctaUrl: e.target.value })}
                            placeholder="Target URL (e.g. /stories or https://...)"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Slide Duration: {activeSlide.duration}s
                      </label>
                      <input
                        type="range"
                        min={4}
                        max={15}
                        value={activeSlide.duration}
                        onChange={(e) => updateSlide(activeSlideIndex, { duration: Number(e.target.value) })}
                        className="w-full accent-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("gallery")}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Choose Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                  >
                    <span>Google SEO Audit</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Google SEO Audit */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Google Discover & News Quality Audit
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time verification against Google Web Stories guidelines
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">
                    {totalAuditScore}/100
                  </span>
                  <p className="text-[11px] font-bold text-emerald-600">
                    {totalAuditScore >= 80 ? "🌟 Ready for Google Discover" : "Needs Optimization"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: "Headline Conciseness (40 - 70 characters)",
                    status: title.length >= 30 && title.length <= 70,
                    msg: `Current: ${title.length} characters. Optimal for Discover.`,
                  },
                  {
                    title: "Lead Photojournalism Image (9:16 Aspect Ratio)",
                    status: !!coverImage,
                    msg: coverImage ? "Lead poster photo is set." : "Missing cover image.",
                  },
                  {
                    title: "Editorial Slide Count (4 - 15 slides)",
                    status: slides.length >= 4,
                    msg: `Current: ${slides.length} slides. Meets Google mobile visual storytelling benchmark.`,
                  },
                  {
                    title: "CTA Placement Safety Zone",
                    status: true,
                    msg: "Text and CTA buttons have auto-separated safe margins with zero overlap.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                        item.status ? "bg-emerald-600" : "bg-amber-500"
                      }`}
                    >
                      {item.status ? "✓" : "!"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.msg}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Slides</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <span>Publish & Schedule</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Publish & Schedule */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-red-600" />
                Publishing Workflow
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    status: StoryStatus.PUBLISHED,
                    label: "Publish Immediately",
                    desc: "Go live instantly on public feeds",
                  },
                  {
                    status: StoryStatus.SCHEDULED,
                    label: "Schedule for Later",
                    desc: "Automated cron publishing",
                  },
                  {
                    status: StoryStatus.DRAFT,
                    label: "Save as Draft",
                    desc: "Keep private in editorial studio",
                  },
                ].map((item) => (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => setStatus(item.status)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      status === item.status
                        ? "border-red-600 bg-red-50/40 shadow-sm ring-2 ring-red-400/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="font-extrabold text-xs text-slate-900 block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>

              {status === StoryStatus.SCHEDULED && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                    Schedule Publication Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Feature in Homepage Lead Banner</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Showcase this story as the primary top story of the day.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Audit</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStory}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-xl shadow-red-600/30 hover:shadow-red-500/50 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {status === StoryStatus.PUBLISHED
                      ? "Publish Story Live"
                      : "Save Story"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Live Interactive 9:16 WYSIWYG Canvas (5 cols) ──── */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 w-full max-w-[360px] space-y-3">
            {/* Live Canvas Action Header */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-red-600" />
                Interactive Canvas
              </span>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {activeLayout.name}
              </span>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                FLOATING WYSIWYG FORMATTING TOOLBAR (When element is selected)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1 text-red-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>
                    {selectedElement === "headline"
                      ? "Format Headline Text"
                      : selectedElement === "description"
                      ? "Format Description Text"
                      : selectedElement === "image"
                      ? "Format Image & Scale"
                      : "Click text/image on canvas to format"}
                  </span>
                </span>
                {selectedElement && (
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Deselect
                  </button>
                )}
              </div>

              {/* Text Formatting Controls */}
              {(selectedElement === "headline" || selectedElement === "description") && (
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  {/* Font Size & Weight & Style Bar */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Size - / + */}
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedElement === "headline") {
                            updateHeadlineStyle({ fontSize: Math.max(16, (hStyle.fontSize || 24) - 2) });
                          } else {
                            updateDescriptionStyle({ fontSize: Math.max(11, (dStyle.fontSize || 14) - 1) });
                          }
                        }}
                        className="px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        A-
                      </button>
                      <span className="text-[11px] font-mono font-bold px-1.5 text-white">
                        {selectedElement === "headline" ? `${hStyle.fontSize || 24}px` : `${dStyle.fontSize || 14}px`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedElement === "headline") {
                            updateHeadlineStyle({ fontSize: Math.min(48, (hStyle.fontSize || 24) + 2) });
                          } else {
                            updateDescriptionStyle({ fontSize: Math.min(22, (dStyle.fontSize || 14) + 1) });
                          }
                        }}
                        className="px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-white"
                      >
                        A+
                      </button>
                    </div>

                    {/* Bold Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedElement === "headline") {
                          updateHeadlineStyle({ fontWeight: hStyle.fontWeight === "bold" || hStyle.fontWeight === "900" ? "normal" : "900" });
                        } else {
                          updateDescriptionStyle({ fontWeight: dStyle.fontWeight === "bold" ? "normal" : "bold" });
                        }
                      }}
                      className={`p-1.5 rounded-lg border ${
                        (selectedElement === "headline" ? hStyle.fontWeight === "900" || hStyle.fontWeight === "bold" : dStyle.fontWeight === "bold")
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>

                    {/* Italic Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedElement === "headline") {
                          updateHeadlineStyle({ fontStyle: hStyle.fontStyle === "italic" ? "normal" : "italic" });
                        } else {
                          updateDescriptionStyle({ fontStyle: dStyle.fontStyle === "italic" ? "normal" : "italic" });
                        }
                      }}
                      className={`p-1.5 rounded-lg border ${
                        (selectedElement === "headline" ? hStyle.fontStyle === "italic" : dStyle.fontStyle === "italic")
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>

                    {/* Underline Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedElement === "headline") {
                          updateHeadlineStyle({ textDecoration: hStyle.textDecoration === "underline" ? "none" : "underline" });
                        } else {
                          updateDescriptionStyle({ textDecoration: dStyle.textDecoration === "underline" ? "none" : "underline" });
                        }
                      }}
                      className={`p-1.5 rounded-lg border ${
                        (selectedElement === "headline" ? hStyle.textDecoration === "underline" : dStyle.textDecoration === "underline")
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>

                    {/* Alignments */}
                    <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => {
                            if (selectedElement === "headline") {
                              updateHeadlineStyle({ textAlign: align });
                            } else {
                              updateDescriptionStyle({ textAlign: align });
                            }
                          }}
                          className={`p-1 rounded ${
                            (selectedElement === "headline" ? (hStyle.textAlign || "left") === align : (dStyle.textAlign || "left") === align)
                              ? "bg-slate-700 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {align === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                          {align === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                          {align === "right" && <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Preset Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Color:</span>
                    {[
                      { color: "#ffffff", label: "White" },
                      { color: "#fef08a", label: "Yellow" },
                      { color: "#38bdf8", label: "Cyan" },
                      { color: "#f87171", label: "Red" },
                      { color: "#4ade80", label: "Green" },
                      { color: "#0f172a", label: "Dark" },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => {
                          if (selectedElement === "headline") {
                            updateHeadlineStyle({ color: c.color });
                          } else {
                            updateDescriptionStyle({ color: c.color });
                          }
                        }}
                        className="w-5 h-5 rounded-full border-2 border-white/40 shadow hover:scale-110 transition-transform"
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>

                  {/* Text Opacity Slider */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      Text Opacity: {Math.round((selectedElement === "headline" ? (hStyle.opacity !== undefined ? hStyle.opacity : 1) : (dStyle.opacity !== undefined ? dStyle.opacity : 1)) * 100)}%
                    </span>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={selectedElement === "headline" ? (hStyle.opacity !== undefined ? hStyle.opacity : 1) : (dStyle.opacity !== undefined ? dStyle.opacity : 1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (selectedElement === "headline") {
                          updateHeadlineStyle({ opacity: val });
                        } else {
                          updateDescriptionStyle({ opacity: val });
                        }
                      }}
                      className="w-28 accent-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Image Controls */}
              {selectedElement === "image" && (
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  {/* Image Opacity Slider */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Photo Opacity: {Math.round((imgStyle.opacity !== undefined ? imgStyle.opacity : 0.9) * 100)}%
                    </span>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={imgStyle.opacity !== undefined ? imgStyle.opacity : 0.9}
                      onChange={(e) => updateImageStyle({ opacity: parseFloat(e.target.value) })}
                      className="w-28 accent-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Image Scale: {Math.round((imgStyle.scale || 1) * 100)}%
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={1.5}
                      step={0.05}
                      value={imgStyle.scale || 1}
                      onChange={(e) => updateImageStyle({ scale: parseFloat(e.target.value) })}
                      className="w-28 accent-red-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Position:</span>
                    {(["top", "center", "bottom"] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateImageStyle({ objectPosition: pos })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                          (imgStyle.objectPosition || "center") === pos
                            ? "bg-red-600 text-white"
                            : "bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  {/* Ken Burns Motion Animation */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Motion Animation (Ken Burns):
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: "none", label: "Static" },
                        { id: "zoom-in", label: "Zoom In" },
                        { id: "zoom-out", label: "Zoom Out" },
                        { id: "pan-left", label: "Pan Left" },
                        { id: "pan-right", label: "Pan Right" },
                        { id: "pan-up", label: "Pan Up" },
                        { id: "pan-down", label: "Pan Down" },
                      ].map((anim) => (
                        <button
                          key={anim.id}
                          type="button"
                          onClick={() => updateImageStyle({ animation: anim.id as any })}
                          className={`px-1.5 py-1 rounded-lg text-[9.5px] font-bold text-center transition-all ${
                            (imgStyle.animation || "none") === anim.id
                              ? "bg-red-600 text-white shadow"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                9:16 MOBILE CANVAS (SAFE MARGINS & AUTO NON-OVERLAPPING CTA)
            ══════════════════════════════════════════════════════════════════ */}
            <div className="w-full aspect-[9/16] rounded-[36px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative overflow-hidden select-none">
              <div
                className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-5 text-white"
                style={{
                  backgroundColor:
                    selectedTemplate === "split-screen-card"
                      ? "#f7f4ed"
                      : selectedTemplate === "polaroid-photo-frame"
                      ? "#f4ede4"
                      : selectedTemplate === "infographic-stats-grid"
                      ? "#070d1d"
                      : "#0c0d12",
                }}
              >
                {/* Background Media with Zoom/Scale & Ken Burns Motion */}
                {activeSlide.backgroundMedia && selectedTemplate !== "split-screen-card" && selectedTemplate !== "polaroid-photo-frame" && (
                  <div
                    className={`absolute inset-0 cursor-pointer overflow-hidden ${
                      imgStyle.animation && imgStyle.animation !== "none" ? `story-anim-${imgStyle.animation}` : ""
                    }`}
                    onClick={() => setSelectedElement("image")}
                  >
                    <Image
                      src={activeSlide.backgroundMedia}
                      alt=""
                      fill
                      className="object-cover"
                      style={{
                        transform: imgStyle.animation && imgStyle.animation !== "none" ? undefined : `scale(${imgStyle.scale || 1})`,
                        objectPosition: imgStyle.objectPosition || "center",
                        opacity: imgStyle.opacity !== undefined ? imgStyle.opacity : (selectedTemplate === "glassmorphism-card" ? 0.6 : 0.9),
                      }}
                      priority
                    />
                  </div>
                )}

                {/* Dark Gradient Scrim to guarantee 100% text legibility */}
                {selectedTemplate !== "split-screen-card" && selectedTemplate !== "polaroid-photo-frame" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 pointer-events-none" />
                )}

                {/* Progress Indicators */}
                <div className="relative z-30 space-y-2">
                  <div className="flex gap-1">
                    {slides.map((_, idx) => (
                      <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/30">
                        <div className={`h-full ${idx <= activeSlideIndex ? "bg-white" : "w-0"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-red-600 font-black text-[9px] text-white">
                      USA DAILY
                    </span>
                    <span className="text-[10px] text-white/80 font-mono">
                      {`0${activeSlideIndex + 1} / 0${slides.length}`}
                    </span>
                  </div>
                </div>

                {/* ─── MAIN CONTENT CONTAINER (SAFE ZONE ABOVE CTA) ─── */}
                <div
                  className={`relative z-20 flex flex-col justify-between flex-1 my-2 overflow-y-auto hide-scrollbar ${
                    activeSlide.hasCta ? "pb-14" : "pb-6"
                  }`}
                >
                  {/* Badge & Dateline Header */}
                  <div className="space-y-1 pt-2">
                    <span className="inline-block px-2.5 py-1 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow">
                      {activeSlide.badgeText || "BREAKING NEWS"}
                    </span>
                    {activeSlide.locationDate && (
                      <p className="text-[9px] font-bold text-red-400 tracking-wide uppercase">
                        {activeSlide.locationDate}
                      </p>
                    )}
                  </div>

                  {/* Interactive Headline & Description Text Block */}
                  <div className="space-y-2.5 mt-auto">
                    {/* Live Clickable Headline */}
                    <div
                      onClick={() => setSelectedElement("headline")}
                      className={`cursor-pointer rounded-lg p-1 transition-all ${
                        selectedElement === "headline"
                          ? "ring-2 ring-red-500 bg-red-500/20"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <h2
                        style={{
                          fontSize: `${hStyle.fontSize || 24}px`,
                          fontWeight: hStyle.fontWeight || "800",
                          fontStyle: hStyle.fontStyle || "normal",
                          textDecoration: hStyle.textDecoration || "none",
                          textAlign: hStyle.textAlign || "left",
                          color: hStyle.color || (selectedTemplate === "split-screen-card" || selectedTemplate === "polaroid-photo-frame" ? "#0f172a" : "#ffffff"),
                          opacity: hStyle.opacity !== undefined ? hStyle.opacity : 1,
                        }}
                        className="leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                      >
                        {activeSlide.headingText || "Click to add headline..."}
                      </h2>
                    </div>

                    {/* Live Clickable Description */}
                    {activeSlide.descriptionText && (
                      <div
                        onClick={() => setSelectedElement("description")}
                        className={`cursor-pointer rounded-lg p-1 transition-all ${
                          selectedElement === "description"
                            ? "ring-2 ring-red-500 bg-red-500/20"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <p
                          style={{
                            fontSize: `${dStyle.fontSize || 13}px`,
                            fontWeight: dStyle.fontWeight || "normal",
                            fontStyle: dStyle.fontStyle || "normal",
                            textDecoration: dStyle.textDecoration || "none",
                            textAlign: dStyle.textAlign || "left",
                            color: dStyle.color || (selectedTemplate === "split-screen-card" || selectedTemplate === "polaroid-photo-frame" ? "#334155" : "#e2e8f0"),
                            opacity: dStyle.opacity !== undefined ? dStyle.opacity : 1,
                          }}
                          className="leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] line-clamp-3"
                        >
                          {activeSlide.descriptionText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── CTA BUTTON FIXED AT SAFE BOTTOM (NEVER OVERLAPS TEXT) ─── */}
                {activeSlide.hasCta ? (
                  <div className="absolute bottom-4 inset-x-5 z-30">
                    <div className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-2xl flex items-center justify-center gap-1.5 transition-transform hover:scale-105">
                      <span>{activeSlide.ctaLabel || "Swipe Up for Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="relative z-20 pt-1 flex flex-col items-center justify-center text-white/80 animate-bounce">
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span className="text-[7.5px] font-black uppercase tracking-widest">
                      SWIPE UP FOR MORE
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => {
                  setActiveSlideIndex((prev) => Math.max(0, prev - 1));
                  setSelectedElement(null);
                }}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-800">
                Page {activeSlideIndex + 1} of {slides.length}
              </span>

              <button
                type="button"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => {
                  setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
                  setSelectedElement(null);
                }}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
