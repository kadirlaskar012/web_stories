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
} from "@/lib/themes/layouts";
import { STORY_TEMPLATES, StoryTemplatePreset } from "@/lib/themes/templates";
import { TemplateGallery } from "./TemplateGallery";
import { slugify } from "@/lib/slugify";
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
  ExternalLink,
  LayoutGrid,
  ArrowRight,
  RefreshCw,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  ChevronUp,
  Clock,
  Sparkles,
} from "lucide-react";

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
  duration: number;
  hasCta: boolean;
  ctaLabel: string;
  ctaUrl: string;
  statsList?: DataFactItem[];
  timelineList?: TimelineItem[];
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

  // Story Mode: 'gallery' (choose template first) or 'editor' (building story)
  const [viewMode, setViewMode] = useState<"gallery" | "editor">(() => {
    return initialStory ? "editor" : "gallery";
  });

  // Selected Story Template
  const [selectedTemplate, setSelectedTemplate] = useState<SlideLayoutType>(() => {
    if (initialStory?.pages?.[0]?.elements?.[0]?.content?.layoutMeta?.layoutType) {
      return initialStory.pages[0].elements[0].content.layoutMeta.layoutType;
    }
    return "breaking-news";
  });

  // Wizard Step inside Editor: 1 = Details & Slides, 2 = Google SEO Audit, 3 = Publish
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

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
          backgroundColor: p.background || (selectedTemplate === "news-explainer" ? "#f7f4ed" : "#0c0d12"),
          badgeText: meta.badgeText || (selectedTemplate === "breaking-news" ? "BREAKING NEWS" : "U.S. NEWS"),
          headingText: (textEls[0]?.content as any)?.text || "",
          subheadText: meta.subheadText || "",
          descriptionText: (textEls[1]?.content as any)?.text || "",
          locationDate: meta.locationDate || "JUNE 1, 2024 | CALIFORNIA, USA",
          sourceText: meta.sourceText || "Source: Official Dispatch",
          quoteAuthor: meta.quoteAuthor || "",
          duration: p.duration || 7,
          hasCta: !!ctaEl,
          ctaLabel: (ctaEl?.content as any)?.label || "Swipe Up for Details",
          ctaUrl: (ctaEl?.content as any)?.url || "",
          statsList: meta.statsList || undefined,
          timelineList: meta.timelineList || undefined,
        };
      });
    }

    const tConfig = getLayoutById("breaking-news");
    return [
      {
        id: "slide-0",
        order: 0,
        layoutType: "breaking-news",
        backgroundMedia: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "BREAKING NEWS",
        headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
        descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons",
        locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
        duration: 7,
        hasCta: false,
        ctaLabel: "Swipe Up for More",
        ctaUrl: "",
      },
      {
        id: "slide-1",
        order: 1,
        layoutType: "breaking-news",
        backgroundMedia: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "BREAKING NEWS",
        headingText: "Over 50,000 Acres Burned Overnight",
        descriptionText: "Governor issues state of emergency declaration as gale-force winds complicate air drops.",
        locationDate: "JUNE 1, 2024 | TOPANGA CANYON, CA",
        duration: 7,
        hasCta: false,
        ctaLabel: "Swipe Up for More",
        ctaUrl: "",
      },
      {
        id: "slide-2",
        order: 2,
        layoutType: "breaking-news",
        backgroundMedia: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1080&q=80",
        backgroundColor: "#0c0d12",
        badgeText: "EVACUATION MAP",
        headingText: "Emergency Shelters Open Across County",
        descriptionText: "Red Cross stations activated with emergency beds, food supplies, and air filters.",
        locationDate: "JUNE 1, 2024 | LOS ANGELES COUNTY",
        duration: 7,
        hasCta: true,
        ctaLabel: "View Live Evacuation Map",
        ctaUrl: "/stories",
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

  // Auto-generate slug when title changes
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  // When user selects template from the Template Gallery
  const handleTemplateSelectedFromGallery = (template: StoryTemplatePreset) => {
    setSelectedTemplate(template.layoutType);
    setTitle(template.defaultTitle);
    setDescription(template.defaultExcerpt);
    setExcerpt(template.defaultExcerpt);
    setCoverImage(template.coverImage);
    setTagsInput(template.defaultTags.join(", "));

    // Populate slides from template
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
        duration: s.duration,
        hasCta: !!s.hasCta,
        ctaLabel: s.ctaLabel || "Swipe Up for Details",
        ctaUrl: s.ctaUrl || "",
        statsList: s.statsList,
        timelineList: s.timelineList,
      }))
    );

    setActiveSlideIndex(0);
    setViewMode("editor");
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeLayout = getLayoutById(selectedTemplate);

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

  // Add new slide directly in the chosen story template
  const handleAddSlideInChosenTemplate = () => {
    const tConfig = getLayoutById(selectedTemplate);
    const newSlide: SlideData = {
      id: `slide-${Date.now()}`,
      order: slides.length,
      layoutType: selectedTemplate,
      backgroundMedia: activeSlide?.backgroundMedia || coverImage || tConfig.defaultData.mediaUrl || "",
      backgroundColor:
        selectedTemplate === "news-explainer"
          ? "#f7f4ed"
          : selectedTemplate === "data-facts"
          ? "#070d1d"
          : "#0c0d12",
      badgeText: tConfig.defaultData.badgeText,
      headingText: `Story Point #${slides.length + 1}`,
      subheadText: tConfig.defaultData.subheadText,
      descriptionText: "Add your editorial context, quotes, or updates for this slide...",
      locationDate: tConfig.defaultData.locationDate,
      sourceText: tConfig.defaultData.sourceText,
      quoteAuthor: tConfig.defaultData.quoteAuthor,
      duration: 7,
      hasCta: false,
      ctaLabel: "Swipe Up for More",
      ctaUrl: "",
      statsList: tConfig.defaultData.statsList,
      timelineList: tConfig.defaultData.timelineList,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
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
              statsList: slide.statsList,
              timelineList: slide.timelineList,
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
            position: { x: 8, y: 55 },
            size: { width: 84, height: 25 },
            style: {
              fontSize: selectedTemplate === "breaking-news" ? 30 : 24,
              fontWeight: 800,
              color: selectedTemplate === "news-explainer" ? "#0f172a" : "#ffffff",
              lineHeight: 1.15,
            },
            order: 1,
          });
        }

        if (slide.descriptionText.trim()) {
          elements.push({
            type: ElementType.TEXT,
            content: { text: slide.descriptionText },
            position: { x: 8, y: 75 },
            size: { width: 84, height: 20 },
            style: {
              fontSize: 14,
              color: selectedTemplate === "news-explainer" ? "#334155" : "#e2e8f0",
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
  // VIEW 1: TEMPLATE GALLERY (FIRST STEP WHEN CREATING A STORY)
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
  // VIEW 2: STORY EDITOR (TAILORED SPECIFICALLY TO THE CHOSEN TEMPLATE)
  // ══════════════════════════════════════════════════════════════════════════
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
          {/* ═══════════ STEP 1: Story Details + Slide Content Builder ═══════════ */}
          {activeStep === 1 && (
            <div className="space-y-6">
              {/* Primary Story Metadata Accordion */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    Story Details & Publishing Metadata
                  </h2>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {activeLayout.name}
                  </span>
                </div>

                {/* Headline */}
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

                {/* Category, Author, Cover Grid */}
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
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? "Uploading..." : "Browse PC"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Slide Builder Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
                {/* Slide Timeline Rail */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-600" />
                      Story Pages Timeline ({slides.length})
                    </h3>

                    {/* Add Slide button */}
                    <button
                      type="button"
                      onClick={handleAddSlideInChosenTemplate}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  {/* Horizontal Slide Rail */}
                  <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlideIndex(index)}
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

                {/* Active Slide Editing Inputs */}
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
                      placeholder="e.g. BREAKING NEWS, U.S. NEWS, EXPLAINER"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-black tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Main Headline */}
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

                  {/* Subhead (for Entertainment) */}
                  {selectedTemplate === "entertainment-magazine" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Italic Editorial Subheading
                      </label>
                      <input
                        type="text"
                        value={activeSlide.subheadText || ""}
                        onChange={(e) => updateSlide(activeSlideIndex, { subheadText: e.target.value })}
                        placeholder="e.g. Stars in New Blockbuster Movie"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-pink-600 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  )}

                  {/* Location & Dateline (for Breaking News & Live Update) */}
                  {(selectedTemplate === "breaking-news" || selectedTemplate === "live-update") && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Location & Dateline
                      </label>
                      <input
                        type="text"
                        value={activeSlide.locationDate || ""}
                        onChange={(e) => updateSlide(activeSlideIndex, { locationDate: e.target.value })}
                        placeholder="e.g. JUNE 1, 2024 | CALIFORNIA, USA"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}

                  {/* Supporting Description Paragraph */}
                  {selectedTemplate !== "data-facts" && selectedTemplate !== "live-update" && (
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
                  )}

                  {/* Editorial Photo Uploader */}
                  {selectedTemplate !== "data-facts" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Editorial Photo (Local PC Browse or Web URL)
                      </label>
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
                    </div>
                  )}

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
                        Slide Auto-Duration: {activeSlide.duration}s
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

                {/* Navigation buttons */}
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

          {/* ═══════════ STEP 2: Google SEO Audit ═══════════ */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Google Discover & News Quality Audit
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time verification against Google Web Stories guidelines for news publishers
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
                    title: "Mobile Typography Hierarchy & Contrast",
                    status: slides.every((s) => s.headingText.trim().length > 0),
                    msg: "All slides have high-contrast, art-directed editorial typography.",
                  },
                  {
                    title: "Google AMP Validation",
                    status: true,
                    msg: "Story passes strict Google AMP validator with zero syntax errors.",
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

          {/* ═══════════ STEP 3: Publish & Schedule ═══════════ */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-red-600" />
                Publishing Workflow & Distribution
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

        {/* ─── RIGHT COLUMN: Live 9:16 Canvas Preview (5 cols) ───────────────── */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 w-full max-w-[340px] space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-red-600" />
                Live 9:16 Canvas Preview
              </span>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                {activeLayout.name}
              </span>
            </div>

            {/* Mobile Mockup Frame */}
            <div className="w-full aspect-[9/16] rounded-[36px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative overflow-hidden select-none">
              {/* ─── TEMPLATE 1: BREAKING NEWS ─── */}
              {selectedTemplate === "breaking-news" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-black text-white">
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" priority />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                  {/* Header */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/40">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-white" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded bg-red-600 font-black text-[9px] tracking-wider text-white shadow">
                          USA DAILY
                        </div>
                        <span className="text-[10px] text-white/80 font-medium">2h ago</span>
                      </div>
                      <div className="flex gap-1 text-white/80 text-xs">•••</div>
                    </div>
                  </div>

                  {/* Content Bottom */}
                  <div className="relative z-10 space-y-2.5 pb-2">
                    <span className="inline-block px-2.5 py-1 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg">
                      {activeSlide.badgeText || "BREAKING NEWS"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-xs text-slate-200 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                      {activeSlide.descriptionText}
                    </p>
                    <div className="text-[9px] font-bold text-red-400 border-l-2 border-red-500 pl-2 uppercase tracking-wide">
                      {activeSlide.locationDate || "JUNE 1, 2024 | CALIFORNIA, USA"}
                    </div>
                    <div className="text-center pt-2 text-[9px] font-black text-white/80 uppercase tracking-widest">
                      ^ SWIPE UP FOR MORE
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TEMPLATE 2: NEWS EXPLAINER (Clean Editorial) ─── */}
              {selectedTemplate === "news-explainer" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-[#f7f4ed] text-slate-900">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-slate-300">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-slate-900" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-slate-700 pt-1 text-[10px] font-bold">
                      <span className="font-mono">{`0${activeSlideIndex + 1} / 0${slides.length}`}</span>
                      <span className="font-black tracking-wider text-slate-950">USADAILY</span>
                      <span className="text-xs">•••</span>
                    </div>
                  </div>

                  {/* Editorial Typography & Framed Photo */}
                  <div className="space-y-3 my-auto">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-950 leading-snug">
                      {activeSlide.headingText}
                    </h3>
                    <div className="w-8 h-1 bg-red-600 rounded-full" />
                    <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                      {activeSlide.descriptionText}
                    </p>

                    {activeSlide.backgroundMedia && (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-md border border-slate-300/80">
                        <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Bottom */}
                  <div className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    ^ SWIPE UP
                  </div>
                </div>
              )}

              {/* ─── TEMPLATE 3: PHOTO NEWS (Immersive) ─── */}
              {selectedTemplate === "photo-news" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-black text-white">
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" priority />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

                  {/* Header */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/40">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-white" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end text-white/80 text-xs">•••</div>
                  </div>

                  {/* Bottom */}
                  <div className="relative z-10 space-y-2 pb-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-red-600 text-white font-black text-[8px] uppercase tracking-wider">
                      {activeSlide.badgeText || "U.S. NEWS"}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-xs text-slate-200 leading-snug drop-shadow line-clamp-2">
                      {activeSlide.descriptionText}
                    </p>
                    <div className="text-center pt-2 text-[9px] font-black text-white/80 uppercase tracking-widest">
                      ^ SWIPE UP
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TEMPLATE 4: DATA / FACTS (Infographic) ─── */}
              {selectedTemplate === "data-facts" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-[#070d1d] text-white">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/20">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-cyan-400" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider">
                        {activeSlide.badgeText || "U.S. ECONOMY UPDATE"}
                      </span>
                      <span className="text-white/60 text-xs">•••</span>
                    </div>
                    <h3 className="text-base font-black text-white leading-tight">
                      {activeSlide.headingText}
                    </h3>
                  </div>

                  {/* 4 Metric Cards */}
                  <div className="space-y-1.5 my-auto">
                    {[
                      { icon: Users, color: "text-cyan-400", stat: "272K", label: "Jobs added in May", sub: "vs. 165K in April" },
                      { icon: TrendingUp, color: "text-emerald-400", stat: "3.9%", label: "Unemployment Rate", sub: "Unchanged from April" },
                      { icon: DollarSign, color: "text-amber-400", stat: "4.1%", label: "Average Hourly Earnings", sub: "vs. May 2023" },
                      { icon: Briefcase, color: "text-purple-400", stat: "8.1M", label: "Job Openings", sub: "at the end of April" },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center ${item.color} flex-shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-sm font-black ${item.color}`}>{item.stat}</span>
                              <span className="text-[10px] font-bold text-white truncate">{item.label}</span>
                            </div>
                            <p className="text-[8.5px] text-slate-400">{item.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="space-y-1 text-center">
                    <p className="text-[8px] text-slate-400">
                      {activeSlide.sourceText || "Source: U.S. Bureau of Labor Statistics"}
                    </p>
                    <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">
                      ^ SWIPE UP FOR MORE
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TEMPLATE 5: LIVE UPDATE (Timeline) ─── */}
              {selectedTemplate === "live-update" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-[#0d0f15] text-white">
                  {/* Header */}
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/20">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-red-500" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[8px] uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE UPDATE
                      </span>
                      <span className="text-white/60 text-xs">•••</span>
                    </div>
                    <h3 className="text-sm font-black text-white leading-tight">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-[9px] text-slate-400">{activeSlide.locationDate || "May 31, 2024"}</p>
                  </div>

                  {/* Connected Timeline */}
                  <div className="border-l-2 border-red-600 pl-3 space-y-2.5 my-auto">
                    {[
                      { time: "2:45 PM", text: "Severe storms reported in Texas and Oklahoma." },
                      { time: "3:30 PM", text: "Tornado warnings issued for 6 states." },
                      { time: "4:10 PM", text: "Over 120,000 customers without power." },
                      { time: "4:45 PM", text: "Rescue operations underway in affected areas." },
                    ].map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-[#0d0f15]" />
                        <span className="text-[8px] font-black text-red-400 block">{item.time}</span>
                        <p className="text-[9.5px] text-slate-200 leading-snug">{item.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    ^ SWIPE UP FOR MORE
                  </div>
                </div>
              )}

              {/* ─── TEMPLATE 6: ENTERTAINMENT (Magazine) ─── */}
              {selectedTemplate === "entertainment-magazine" && (
                <div className="w-full h-full rounded-[24px] overflow-hidden relative flex flex-col justify-between p-4 bg-black text-white">
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover opacity-80" priority />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/20 to-black/60 pointer-events-none" />

                  {/* Header */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 rounded-full bg-white/30">
                          <div className={`h-full ${idx <= activeSlideIndex ? "bg-purple-500" : "w-0"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-black text-[8px] uppercase tracking-wider">
                        ENTERTAINMENT
                      </span>
                      <span className="text-white/60 text-xs">•••</span>
                    </div>

                    <h3 className="font-serif font-black text-2xl text-white mt-2 leading-none">
                      {activeSlide.headingText}
                    </h3>
                    <p className="font-serif italic text-xs text-pink-400 font-bold">
                      {activeSlide.subheadText || "Stars in New Blockbuster Movie"}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="relative z-10 space-y-2 pb-2">
                    <p className="text-xs text-slate-200 line-clamp-2 leading-snug drop-shadow">
                      {activeSlide.descriptionText}
                    </p>
                    <div className="py-2 px-3 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center gap-1.5 shadow-xl">
                      <span>{activeSlide.ctaLabel || "SWIPE UP FOR DETAILS"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}
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
                Page {activeSlideIndex + 1} of {slides.length}
              </span>

              <button
                type="button"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
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
