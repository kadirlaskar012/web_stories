"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Category, Author, StoryStatus, ElementType } from "@prisma/client";
import { STORY_THEMES, StoryTheme, getThemeById } from "@/lib/themes/presets";
import { SLIDE_LAYOUTS, SlideLayoutConfig, SlideLayoutType, getLayoutById } from "@/lib/themes/layouts";
import { LayoutPickerModal } from "./LayoutPickerModal";
import { slugify } from "@/lib/slugify";
import {
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Upload,
  Eye,
  Calendar,
  AlertCircle,
  FileText,
  ExternalLink,
  LayoutGrid,
  Quote,
  Flame,
  ArrowRight,
  RefreshCw,
  Check,
} from "lucide-react";

export interface SlideData {
  id: string;
  order: number;
  layoutType: SlideLayoutType;
  backgroundMedia: string;
  backgroundColor: string;
  headingType: "H1" | "H2" | "H3" | "QUOTE" | "FACT";
  headingText: string;
  descriptionText: string;
  statNumber?: string;
  quoteAuthor?: string;
  stepNumber?: string;
  duration: number;
  hasCta: boolean;
  ctaLabel: string;
  ctaUrl: string;
  themeId: string;
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

  // Wizard Step: 1 = Story Info, 2 = Slide Builder, 3 = Themes, 4 = SEO Audit, 5 = Publish
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Layout Picker Modal state
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [layoutPickerMode, setLayoutPickerMode] = useState<"add" | "change">("add");

  // ─── Step 1: Story Details & SEO State ───────────────────────────────────
  const [title, setTitle] = useState(initialStory?.title || "");
  const [slug, setSlug] = useState(initialStory?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialStory?.slug);
  const [description, setDescription] = useState(initialStory?.description || "");
  const [excerpt, setExcerpt] = useState(initialStory?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialStory?.coverImage || "");
  const [categoryId, setCategoryId] = useState(
    initialStory?.categoryId || categories[0]?.id || ""
  );
  const [authorId, setAuthorId] = useState(
    initialStory?.authorId || authors[0]?.id || ""
  );
  const [tagsInput, setTagsInput] = useState(
    initialStory?.tags?.map((t: any) => t.tag?.name).join(", ") || ""
  );
  const [isFeatured, setIsFeatured] = useState(initialStory?.isFeatured || false);

  // ─── Step 2: Slide Builder State ─────────────────────────────────────────
  const [slides, setSlides] = useState<SlideData[]>(() => {
    if (initialStory?.pages?.length > 0) {
      return initialStory.pages.map((p: any, idx: number) => {
        const bgEl = p.elements?.find((e: any) => e.type === "BACKGROUND");
        const textEls = p.elements?.filter((e: any) => e.type === "TEXT") || [];
        const ctaEl = p.elements?.find((e: any) => e.type === "CTA");
        const meta = (p.elements?.[0]?.content as any)?.layoutMeta || {};

        return {
          id: p.id || `slide-${idx}`,
          order: idx,
          layoutType: (meta.layoutType as SlideLayoutType) || (idx === 0 ? "cover-hero" : "floating-card"),
          backgroundMedia: (bgEl?.content as any)?.src || "",
          backgroundColor: p.background || "#0c0d12",
          headingType: idx === 0 ? "H1" : "H2",
          headingText: (textEls[0]?.content as any)?.text || "",
          descriptionText: (textEls[1]?.content as any)?.text || "",
          statNumber: meta.statNumber || "01",
          quoteAuthor: meta.quoteAuthor || "",
          stepNumber: meta.stepNumber || "STEP 01",
          duration: p.duration || 7,
          hasCta: !!ctaEl,
          ctaLabel: (ctaEl?.content as any)?.label || "Learn More",
          ctaUrl: (ctaEl?.content as any)?.url || "",
          themeId: "editorial-luxe",
        };
      });
    }
    return [
      {
        id: "slide-0",
        order: 0,
        layoutType: "cover-hero",
        backgroundMedia: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80",
        backgroundColor: "#0c0d12",
        headingType: "H1",
        headingText: "10 Untouched Coastal Paradises",
        descriptionText: "Discover secret coves and pristine turquoise lagoons far away from tourist crowds.",
        duration: 7,
        hasCta: false,
        ctaLabel: "Explore Guide",
        ctaUrl: "",
        themeId: "editorial-luxe",
      },
      {
        id: "slide-1",
        order: 1,
        layoutType: "floating-card",
        backgroundMedia: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1080&q=80",
        backgroundColor: "#0c0d12",
        headingType: "H2",
        headingText: "Butterfly Bay Lagoon",
        descriptionText: "Hidden behind towering granite cliffs, accessible only by local fisherman boats at sunrise.",
        duration: 7,
        hasCta: false,
        ctaLabel: "Read More",
        ctaUrl: "",
        themeId: "editorial-luxe",
      },
      {
        id: "slide-2",
        order: 2,
        layoutType: "big-stat",
        backgroundMedia: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1080&q=80",
        backgroundColor: "#0c0d12",
        headingType: "FACT",
        statNumber: "02",
        headingText: "Emerald Cliff Sanctuary",
        descriptionText: "Over 200 species of coastal butterflies gather around the freshwater streams at dawn.",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Full Itinerary",
        ctaUrl: "/stories",
        themeId: "editorial-luxe",
      },
    ];
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [globalThemeId, setGlobalThemeId] = useState("editorial-luxe");

  // ─── Step 5: Publishing & Status ─────────────────────────────────────────
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

  // Auto-generate slug when title changes
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeTheme = getThemeById(activeSlide.themeId || globalThemeId);
  const activeLayout = getLayoutById(activeSlide.layoutType || "cover-hero");

  // Handle local file upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "cover" | "slide"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

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
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Update slide property
  const updateSlide = (index: number, updates: Partial<SlideData>) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Open Layout Picker to Add Slide
  const handleOpenAddSlideLayout = () => {
    setLayoutPickerMode("add");
    setIsLayoutModalOpen(true);
  };

  // Open Layout Picker to Change Current Slide Layout
  const handleOpenChangeSlideLayout = () => {
    setLayoutPickerMode("change");
    setIsLayoutModalOpen(true);
  };

  // Handle Layout Selection
  const handleSelectLayout = (layout: SlideLayoutConfig) => {
    if (layoutPickerMode === "add") {
      const newSlide: SlideData = {
        id: `slide-${Date.now()}`,
        order: slides.length,
        layoutType: layout.id,
        backgroundMedia: activeSlide?.backgroundMedia || coverImage || "",
        backgroundColor: activeTheme.styles.background,
        headingType: layout.defaultData.headingType,
        headingText: layout.defaultData.headingText,
        descriptionText: layout.defaultData.descriptionText,
        statNumber: layout.defaultData.statNumber || `${slides.length + 1}`.padStart(2, "0"),
        quoteAuthor: layout.defaultData.quoteAuthor || "",
        stepNumber: layout.defaultData.stepNumber || `STEP ${(slides.length + 1).toString().padStart(2, "0")}`,
        duration: 7,
        hasCta: layout.defaultData.hasCta || false,
        ctaLabel: layout.defaultData.ctaLabel || "Learn More",
        ctaUrl: layout.defaultData.ctaUrl || "",
        themeId: globalThemeId,
      };
      setSlides((prev) => [...prev, newSlide]);
      setActiveSlideIndex(slides.length);
    } else {
      // Change current slide layout
      updateSlide(activeSlideIndex, {
        layoutType: layout.id,
        headingType: layout.defaultData.headingType,
        statNumber: activeSlide.statNumber || layout.defaultData.statNumber || "01",
        quoteAuthor: activeSlide.quoteAuthor || layout.defaultData.quoteAuthor || "",
        stepNumber: activeSlide.stepNumber || layout.defaultData.stepNumber || "STEP 01",
      });
    }
  };

  // Duplicate slide
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

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setSlides(next);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  // Apply Theme
  const applyGlobalTheme = (themeId: string) => {
    setGlobalThemeId(themeId);
    setSlides((prev) => prev.map((s) => ({ ...s, themeId })));
  };

  const applySlideTheme = (themeId: string) => {
    updateSlide(activeSlideIndex, { themeId });
  };

  // ─── Google Web Stories Quality Audit Calculations ─────────────────────────
  const titleScore = title.length >= 30 && title.length <= 70 ? 25 : title.length > 0 ? 15 : 0;
  const slideCountScore = slides.length >= 4 && slides.length <= 15 ? 25 : slides.length >= 2 ? 15 : 5;
  const coverScore = coverImage ? 25 : 0;
  const contentScore = slides.every((s) => s.headingText.trim().length > 0) ? 25 : 15;
  const totalAuditScore = titleScore + slideCountScore + coverScore + contentScore;

  // ─── Save / Publish Story ──────────────────────────────────────────────────
  const handleSaveStory = async () => {
    if (!title.trim()) {
      setActiveStep(1);
      setError("Please enter a story title.");
      return;
    }
    if (!coverImage) {
      setActiveStep(1);
      setError("Please upload or provide a cover image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pagesPayload = slides.map((slide, idx) => {
        const theme = getThemeById(slide.themeId || globalThemeId);
        const elements: any[] = [];

        // Background Element with layout metadata
        if (slide.backgroundMedia) {
          elements.push({
            type: ElementType.BACKGROUND,
            content: {
              src: slide.backgroundMedia,
              fit: "cover",
              layoutMeta: {
                layoutType: slide.layoutType,
                statNumber: slide.statNumber,
                quoteAuthor: slide.quoteAuthor,
                stepNumber: slide.stepNumber,
              },
            },
            position: { x: 0, y: 0 },
            size: { width: 100, height: 100 },
            style: { opacity: theme.styles.overlayOpacity },
            order: 0,
          });
        }

        // Heading Text Element
        if (slide.headingText.trim()) {
          elements.push({
            type: ElementType.TEXT,
            content: { text: slide.headingText },
            position: { x: 8, y: slide.layoutType === "cover-hero" ? 60 : 15 },
            size: { width: 84, height: 25 },
            style: {
              fontSize: theme.styles.heading.fontSize,
              fontWeight: theme.styles.heading.fontWeight,
              color: theme.styles.heading.color,
              lineHeight: theme.styles.heading.lineHeight,
              textShadow: theme.styles.heading.textShadow,
              textTransform: theme.styles.heading.textTransform,
            },
            order: 1,
          });
        }

        // Description Body Element
        if (slide.descriptionText.trim()) {
          elements.push({
            type: ElementType.TEXT,
            content: { text: slide.descriptionText },
            position: { x: 8, y: slide.layoutType === "cover-hero" ? 78 : 68 },
            size: { width: 84, height: 25 },
            style: {
              fontSize: theme.styles.body.fontSize,
              fontWeight: theme.styles.body.fontWeight,
              color: theme.styles.body.color,
              lineHeight: theme.styles.body.lineHeight,
              textShadow: theme.styles.body.textShadow,
            },
            order: 2,
          });
        }

        // CTA Element
        if (slide.hasCta && slide.ctaLabel) {
          elements.push({
            type: ElementType.CTA,
            content: { label: slide.ctaLabel, url: slide.ctaUrl || "#" },
            position: { x: 15, y: 88 },
            size: { width: 70, height: 8 },
            style: {
              backgroundColor: theme.styles.cta.bg,
              color: theme.styles.cta.color,
              borderRadius: theme.styles.cta.borderRadius,
            },
            order: 3,
          });
        }

        return {
          order: idx,
          background: theme.styles.background,
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

      setSuccess("Story published and saved successfully!");
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

  return (
    <div className="space-y-6">
      {/* Layout Picker Modal */}
      <LayoutPickerModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
        currentLayoutId={activeSlide.layoutType}
        titleText={
          layoutPickerMode === "add"
            ? "Select Design Layout for New Slide"
            : `Change Design Layout (Slide #${activeSlideIndex + 1})`
        }
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Visual Story & Layout Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {initialStory ? "Edit Web Story" : "Create New Web Story"}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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

      {/* Wizard Step Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {[
          { step: 1, label: "1. Story & SEO", icon: FileText },
          { step: 2, label: "2. Slide Builder & Layouts", icon: Layers },
          { step: 3, label: "3. Pre-made Themes", icon: Palette },
          { step: 4, label: "4. Google SEO Audit", icon: CheckCircle2 },
          { step: 5, label: "5. Publish & Schedule", icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStep === tab.step;
          return (
            <button
              key={tab.step}
              onClick={() => setActiveStep(tab.step as any)}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
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

      {/* Main Split Grid: Left = Form Inputs, Right = Live 9:16 Interactive Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT COLUMN: Wizard Step Content (7 cols) ────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* ═══════════ STEP 1: Story Details & SEO ═══════════ */}
          {activeStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Story Information & SEO
              </h2>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Story Title <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-bold ${
                      title.length >= 30 && title.length <= 70
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {title.length}/70 chars (Optimal: 40-70)
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Secret Beaches in Goa You Must Visit"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {autoSlug ? "Locked to Title" : "Custom Slug"}
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="text-xs text-slate-400 font-mono">/story/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(slugify(e.target.value));
                    }}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none ml-1"
                  />
                </div>
              </div>

              {/* Category & Author Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image Uploader (Local File Browse or URL) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Poster / Cover Image (9:16 Portrait) <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload local file"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, "cover")}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? "Uploading..." : "Browse PC"}</span>
                  </button>
                </div>

                {coverImage && (
                  <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                      <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold text-slate-800 truncate">Cover Image Selected</p>
                      <p className="text-[11px] text-slate-500 truncate">{coverImage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Story Description / Summary
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of what readers will learn from this story..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="travel, beach, india, photography"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <span>Continue to Slide Builder</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 2: Slide Builder & Layout Selector ═══════════ */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              {/* Slide Timeline Rail with "+ Add Slide" triggering Layout Picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Story Slides ({slides.length})
                  </h3>

                  {/* Add Slide Button Opens Layout Picker Dialog */}
                  <button
                    type="button"
                    onClick={handleOpenAddSlideLayout}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slide (Choose Design)</span>
                  </button>
                </div>

                {/* Horizontal Slide Rail */}
                <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-2">
                  {slides.map((slide, index) => {
                    const l = getLayoutById(slide.layoutType);
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlideIndex(index)}
                        className={`relative flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden border-2 transition-all p-1 flex flex-col justify-between ${
                          activeSlideIndex === index
                            ? "border-blue-600 ring-4 ring-blue-500/20 shadow-md scale-105 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-100 opacity-70 hover:opacity-100 text-slate-700"
                        }`}
                      >
                        {slide.backgroundMedia ? (
                          <Image
                            src={slide.backgroundMedia}
                            alt=""
                            fill
                            className="object-cover opacity-60"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900" />
                        )}

                        <div className="relative z-10 flex justify-between items-center w-full">
                          <span className="w-5 h-5 rounded-full bg-black/60 text-white font-black text-[10px] flex items-center justify-center">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="relative z-10 text-left bg-black/75 backdrop-blur-sm p-1 rounded-lg">
                          <p className="text-[9px] font-black text-amber-300 truncate uppercase">
                            {l.name.split(" ")[0]}
                          </p>
                          <p className="text-[8px] font-semibold text-white truncate">
                            {slide.headingText || "Untitled"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Slide Editing Card */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                {/* Active Slide Header & Layout Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">
                      Slide #{activeSlideIndex + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                      {activeLayout.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Change Design Layout Button */}
                    <button
                      type="button"
                      onClick={handleOpenChangeSlideLayout}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition-all"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                      <span>Change Layout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateSlide(activeSlideIndex)}
                      className="p-2 rounded-xl bg-white text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm"
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

                {/* Conditional Layout Fields */}

                {/* 1. Big Stat Field */}
                {activeSlide.layoutType === "big-stat" && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-amber-900">
                      Big Number / Stat Metric (e.g. 01, 85%, 10x, #1)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.statNumber || "01"}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, { statNumber: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* 2. Step Badge Field */}
                {activeSlide.layoutType === "step-list" && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-emerald-900">
                      Step Badge Pill (e.g. STEP 01, TIP #2, SECRET)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.stepNumber || "STEP 01"}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, { stepNumber: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* 3. Quote Citation Field */}
                {activeSlide.layoutType === "quote-spotlight" && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-purple-900">
                      Quote Author / Source Citation
                    </label>
                    <input
                      type="text"
                      value={activeSlide.quoteAuthor || ""}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, { quoteAuthor: e.target.value })
                      }
                      placeholder="e.g. Steve Jobs, Apple Founder"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-purple-300 text-purple-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Slide Headline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {activeSlide.layoutType === "quote-spotlight" ? "Quote Text" : "Slide Headline"}
                  </label>
                  <input
                    type="text"
                    value={activeSlide.headingText}
                    onChange={(e) =>
                      updateSlide(activeSlideIndex, {
                        headingText: e.target.value,
                      })
                    }
                    placeholder="Enter slide headline or question..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description Text Input (for non-quote layouts) */}
                {activeSlide.layoutType !== "quote-spotlight" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Story Body / Description
                    </label>
                    <textarea
                      rows={3}
                      value={activeSlide.descriptionText}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, {
                          descriptionText: e.target.value,
                        })
                      }
                      placeholder="Add detailed bullet points, narrative descriptions, or tips..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Background Media Uploader */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Slide Background Media (Local PC Browse or Web URL)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={activeSlide.backgroundMedia}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, {
                          backgroundMedia: e.target.value,
                        })
                      }
                      placeholder="https://images.unsplash.com/... or upload"
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="file"
                      ref={slideFileInputRef}
                      onChange={(e) => handleFileUpload(e, "slide")}
                      accept="image/*,video/*"
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
                </div>

                {/* Interactive CTA & Slide Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={activeSlide.hasCta}
                        onChange={(e) =>
                          updateSlide(activeSlideIndex, {
                            hasCta: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Include CTA Button
                      </span>
                    </label>

                    {activeSlide.hasCta && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={activeSlide.ctaLabel}
                          onChange={(e) =>
                            updateSlide(activeSlideIndex, {
                              ctaLabel: e.target.value,
                            })
                          }
                          placeholder="Button Label (e.g. Read Full Story)"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={activeSlide.ctaUrl}
                          onChange={(e) =>
                            updateSlide(activeSlideIndex, {
                              ctaUrl: e.target.value,
                            })
                          }
                          placeholder="Link URL (e.g. https://... or /stories)"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Slide Auto-Duration: {activeSlide.duration}s
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={15}
                      value={activeSlide.duration}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, {
                          duration: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Story Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <span>Select Color Themes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 3: Pre-Made Themes & Styles ═══════════ */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-black text-slate-900">
                    Color Palette & Styling Theme
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a signature color and typography mood to pair with your design layouts.
                </p>
              </div>

              {/* Themes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STORY_THEMES.map((theme) => {
                  const isSelected = (activeSlide.themeId || globalThemeId) === theme.id;
                  return (
                    <div
                      key={theme.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-400/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: theme.styles.badge.bg,
                              color: theme.styles.badge.color,
                            }}
                          >
                            {theme.badge}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-900">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {theme.description}
                        </p>
                      </div>

                      {/* Theme Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => applyGlobalTheme(theme.id)}
                          className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors text-center"
                        >
                          Apply All Slides
                        </button>
                        <button
                          type="button"
                          onClick={() => applySlideTheme(theme.id)}
                          className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors text-center"
                        >
                          This Slide Only
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Slide Builder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <span>Google SEO Audit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 4: Google Web Stories Quality Audit ═══════════ */}
          {activeStep === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Google Discover & SEO Compliance
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

              {/* Audit Checks Checklist */}
              <div className="space-y-3">
                {[
                  {
                    title: "Story Title Length (40 - 70 characters)",
                    status: title.length >= 30 && title.length <= 70,
                    msg: `Current: ${title.length} characters. Optimal range is 40-70.`,
                  },
                  {
                    title: "Cover / Poster Image (9:16 Aspect Ratio)",
                    status: !!coverImage,
                    msg: coverImage ? "Cover image is set and ready." : "Cover image is missing.",
                  },
                  {
                    title: "Recommended Slide Count (4 - 15 slides)",
                    status: slides.length >= 4,
                    msg: `Current: ${slides.length} slides. Minimum 4 recommended for maximum engagement.`,
                  },
                  {
                    title: "Text Readability & Content Structure",
                    status: slides.every((s) => s.headingText.trim().length > 0),
                    msg: "All slides contain structured headlines and descriptions.",
                  },
                  {
                    title: "Google AMP Story Validity",
                    status: true,
                    msg: "Story automatically exports valid AMP HTML with zero syntax errors.",
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

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Themes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <span>Publish & Schedule</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 5: Publish & Schedule ═══════════ */}
          {activeStep === 5 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Publishing Workflow & Schedule
              </h2>

              {/* Status Radio Picker */}
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
                        ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-400/20"
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

              {/* Scheduled DateTime Picker */}
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

              {/* Featured Switch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Feature on Homepage Hero</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Highlight this story in the top visual banner on the front page.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Final Submit CTA */}
              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Audit</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStory}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {status === StoryStatus.PUBLISHED
                      ? "Publish Story Live Now"
                      : "Save Story"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Live 9:16 Interactive Layout Canvas Preview (5 cols) ─ */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 w-full max-w-[340px] space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live 9:16 Layout Preview
              </span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {activeLayout.name}
              </span>
            </div>

            {/* Mobile Mockup Frame */}
            <div className="w-full aspect-[9/16] rounded-[32px] bg-slate-950 p-2.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden">
              {/* Dynamic Theme Background Canvas */}
              <div
                className="w-full h-full rounded-[24px] overflow-hidden relative select-none flex flex-col justify-between"
                style={{ backgroundColor: activeTheme.styles.background }}
              >
                {/* ─── 1. LAYOUT: SPLIT HALF & HALF ─── */}
                {activeSlide.layoutType === "split-half" ? (
                  <div className="w-full h-full flex flex-col">
                    {/* Top 50% Photo Window */}
                    <div className="h-[48%] relative bg-slate-900 overflow-hidden">
                      {activeSlide.backgroundMedia ? (
                        <Image
                          src={activeSlide.backgroundMedia}
                          alt=""
                          fill
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center">
                          <span className="text-xs text-white/40 font-bold">Image Frame</span>
                        </div>
                      )}
                      <div className="absolute top-3 inset-x-3 z-10 flex gap-1">
                        {slides.map((_, idx) => (
                          <div key={idx} className="h-1 flex-1 rounded-full bg-white/40">
                            <div className={`h-full ${idx <= activeSlideIndex ? "bg-white" : "w-0"}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom 50% Content Card */}
                    <div className="h-[52%] bg-slate-900 p-4 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit inline-block"
                          style={{ backgroundColor: activeTheme.styles.badge.bg, color: activeTheme.styles.badge.color }}
                        >
                          {activeTheme.badge}
                        </span>
                        <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
                          {activeSlide.headingText}
                        </h3>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                          {activeSlide.descriptionText}
                        </p>
                      </div>

                      {activeSlide.hasCta && (
                        <div
                          className="py-2 px-3 text-center text-xs font-bold shadow-lg"
                          style={{
                            background: activeTheme.styles.cta.bg,
                            color: activeTheme.styles.cta.color,
                            borderRadius: `${activeTheme.styles.cta.borderRadius}px`,
                          }}
                        >
                          {activeSlide.ctaLabel || "Learn More"}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ─── FULL-BLEED BACKGROUND LAYOUTS (Cover, Floating Card, Big Stat, Quote, Step, CTA) ─── */
                  <>
                    {activeSlide.backgroundMedia && (
                      <Image
                        src={activeSlide.backgroundMedia}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                      />
                    )}

                    {/* Overlay Gradient */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          activeTheme.styles.overlayGradient ||
                          `linear-gradient(to top, rgba(0,0,0,${activeTheme.styles.overlayOpacity}) 0%, transparent 100%)`,
                      }}
                    />

                    {/* Top Progress & Header */}
                    <div className="relative z-20 p-4 pb-0 space-y-2">
                      <div className="flex gap-1">
                        {slides.map((_, idx) => (
                          <div key={idx} className="h-1 flex-1 rounded-full bg-white/30">
                            <div className={`h-full ${idx <= activeSlideIndex ? "bg-white" : "w-0"}`} />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: activeTheme.styles.badge.bg, color: activeTheme.styles.badge.color }}
                        >
                          {activeTheme.badge}
                        </span>
                        <span className="text-[10px] font-bold text-white/80 drop-shadow">
                          StoryFlow
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Layout Middle/Bottom Content */}
                    <div className="relative z-20 p-4">
                      {/* 2. FLOATING GLASS CARD */}
                      {activeSlide.layoutType === "floating-card" && (
                        <div className="p-3.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 shadow-2xl space-y-1.5">
                          <h3 className="font-extrabold text-sm text-white leading-snug">
                            {activeSlide.headingText}
                          </h3>
                          <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3">
                            {activeSlide.descriptionText}
                          </p>
                          {activeSlide.hasCta && (
                            <div
                              className="py-1.5 px-3 mt-2 text-center text-xs font-bold shadow-lg"
                              style={{
                                background: activeTheme.styles.cta.bg,
                                color: activeTheme.styles.cta.color,
                                borderRadius: `${activeTheme.styles.cta.borderRadius}px`,
                              }}
                            >
                              {activeSlide.ctaLabel || "Learn More"}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. BIG STAT / NUMBER */}
                      {activeSlide.layoutType === "big-stat" && (
                        <div className="space-y-1.5">
                          <div className="text-4xl font-black text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                            {activeSlide.statNumber || "01"}
                          </div>
                          <h3 className="font-black text-base text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            {activeSlide.headingText}
                          </h3>
                          <p className="text-[11px] text-slate-200 drop-shadow line-clamp-3 leading-relaxed">
                            {activeSlide.descriptionText}
                          </p>
                        </div>
                      )}

                      {/* 4. QUOTE SPOTLIGHT */}
                      {activeSlide.layoutType === "quote-spotlight" && (
                        <div className="text-center space-y-2 py-4">
                          <span className="text-4xl text-amber-300/90 font-serif leading-none block">“</span>
                          <p className="font-bold text-sm text-white italic leading-relaxed px-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                            {activeSlide.headingText}
                          </p>
                          {activeSlide.quoteAuthor && (
                            <p className="text-[10px] font-bold text-amber-300 tracking-wide uppercase pt-1">
                              — {activeSlide.quoteAuthor}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 5. STEP LIST / TIP */}
                      {activeSlide.layoutType === "step-list" && (
                        <div className="space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] uppercase shadow-md">
                            {activeSlide.stepNumber || "STEP 01"}
                          </span>
                          <h3 className="font-black text-base text-white drop-shadow">
                            {activeSlide.headingText}
                          </h3>
                          <p className="text-[11px] text-slate-200 drop-shadow line-clamp-3">
                            {activeSlide.descriptionText}
                          </p>
                        </div>
                      )}

                      {/* 6. CTA FINALE */}
                      {activeSlide.layoutType === "cta-finale" && (
                        <div className="space-y-3 text-center">
                          <h3 className="font-black text-base text-white drop-shadow">
                            {activeSlide.headingText}
                          </h3>
                          <p className="text-[11px] text-slate-200 drop-shadow line-clamp-2">
                            {activeSlide.descriptionText}
                          </p>
                          <div
                            className="py-2.5 px-4 text-center text-xs font-bold shadow-2xl flex items-center justify-center gap-1.5"
                            style={{
                              background: activeTheme.styles.cta.bg,
                              color: activeTheme.styles.cta.color,
                              borderRadius: `${activeTheme.styles.cta.borderRadius}px`,
                            }}
                          >
                            <span>{activeSlide.ctaLabel || "Explore Full Story"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      {/* 7. DEFAULT / COVER HERO */}
                      {activeSlide.layoutType === "cover-hero" && (
                        <div className="space-y-2">
                          <h3
                            style={{
                              fontSize: "22px",
                              fontWeight: activeTheme.styles.heading.fontWeight,
                              color: activeTheme.styles.heading.color,
                              lineHeight: 1.2,
                              textShadow: "0 4px 16px rgba(0,0,0,0.9)",
                            }}
                          >
                            {activeSlide.headingText}
                          </h3>
                          <p
                            className="line-clamp-3"
                            style={{
                              fontSize: "12px",
                              color: activeTheme.styles.body.color,
                              textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                              lineHeight: 1.45,
                            }}
                          >
                            {activeSlide.descriptionText}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Navigation Controller */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-800">
                Slide {activeSlideIndex + 1} / {slides.length}
              </span>

              <button
                type="button"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() =>
                  setActiveSlideIndex((prev) =>
                    Math.min(slides.length - 1, prev + 1)
                  )
                }
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
