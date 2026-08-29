"use client";
import React, { useState } from "react";
import Image from "next/image";
import { STORY_TEMPLATES, StoryTemplatePreset } from "@/lib/themes/templates";
import {
  Sparkles,
  ArrowRight,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers,
  Check,
  Play,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate: (template: StoryTemplatePreset) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewingTemplate, setPreviewingTemplate] = useState<StoryTemplatePreset | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  const categories = [
    "All",
    "News & Politics",
    "Editorial & Feature",
    "Economy & Tech",
    "Travel & Lifestyle",
    "Entertainment & Sports",
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? STORY_TEMPLATES
      : STORY_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleOpenPreview = (template: StoryTemplatePreset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewingTemplate(template);
    setPreviewSlideIndex(0);
  };

  const handleClosePreview = () => {
    setPreviewingTemplate(null);
    setPreviewSlideIndex(0);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Gallery Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-black text-xs uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 · Choose Your Story Template</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Select a Web Story Design
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore 16 signature American digital newsroom and magazine templates. Click <strong className="text-slate-800">Preview</strong> to test live slides, or click <strong className="text-red-600">Use Template</strong> to start creating.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? STORY_TEMPLATES.length
              : STORY_TEMPLATES.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-slate-950 text-white shadow-lg scale-105"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 shadow-sm"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates 16-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group rounded-3xl bg-white border-2 border-slate-200/90 hover:border-red-600 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top 9:16 Card Image */}
            <div
              className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer"
              onClick={() => handleOpenPreview(template)}
            >
              {template.coverImage ? (
                <Image
                  src={template.coverImage}
                  alt={template.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                  <Layers className="w-12 h-12 text-cyan-400 opacity-60" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Top Badge & Live Preview Button */}
              <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-white font-black text-[9px] uppercase tracking-wider shadow ${template.badgeColor}`}>
                  {template.badge}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleOpenPreview(template, e)}
                  className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-white/20 shadow transition-all hover:scale-105"
                  title="Interactive Slide Preview"
                >
                  <Eye className="w-3 h-3 text-red-400" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Bottom Preview Title */}
              <div className="absolute bottom-3 inset-x-3 z-10 space-y-0.5">
                <p className="text-[9px] font-bold uppercase text-red-400 tracking-wider">
                  {template.category}
                </p>
                <h3 className="text-xs font-black text-white leading-tight drop-shadow line-clamp-2">
                  {template.defaultTitle}
                </h3>
              </div>
            </div>

            {/* Template Info & Action Buttons */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                    {template.name}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {template.defaultSlides.length} Pgs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* 2 Buttons: Preview & Use Template */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(template)}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                  className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-600 text-white font-black text-xs shadow-sm hover:shadow-red-600/30 flex items-center justify-center gap-1 transition-all"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          INTERACTIVE 9:16 LIVE SAMPLE PREVIEW MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {previewingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in select-none"
          onClick={handleClosePreview}
        >
          <div
            className="relative w-full max-w-[400px] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Controls */}
            <div className="w-full flex items-center justify-between text-white px-2">
              <div>
                <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                  Interactive Preview
                </span>
                <h3 className="text-sm font-black truncate max-w-[220px]">
                  {previewingTemplate.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplate(previewingTemplate)}
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <span>Use This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 9:16 Mobile Canvas Preview */}
            <div
              className="relative w-full aspect-[9/16] rounded-[36px] overflow-hidden bg-black shadow-2xl border-4 border-slate-700 flex flex-col justify-between p-5 text-white"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width * 0.3) {
                  setPreviewSlideIndex((p) => Math.max(0, p - 1));
                } else {
                  setPreviewSlideIndex((p) =>
                    Math.min(previewingTemplate.defaultSlides.length - 1, p + 1)
                  );
                }
              }}
            >
              {/* Background Media */}
              {previewingTemplate.defaultSlides[previewSlideIndex]?.backgroundMedia && (
                <Image
                  src={previewingTemplate.defaultSlides[previewSlideIndex].backgroundMedia}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
              )}

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

              {/* Top Progress Bars */}
              <div className="relative z-20 space-y-2">
                <div className="flex gap-1">
                  {previewingTemplate.defaultSlides.map((_, i) => (
                    <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          i <= previewSlideIndex ? "bg-white w-full" : "w-0"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-600 font-black text-[9px] text-white">
                    USA DAILY
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">
                    {`0${previewSlideIndex + 1} / 0${previewingTemplate.defaultSlides.length}`}
                  </span>
                </div>
              </div>

              {/* Middle / Bottom Content of Active Slide */}
              <div className="relative z-20 space-y-3 pb-2">
                <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow">
                  {previewingTemplate.defaultSlides[previewSlideIndex]?.badgeText || "DISPATCH"}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                  {previewingTemplate.defaultSlides[previewSlideIndex]?.headingText}
                </h3>

                {previewingTemplate.defaultSlides[previewSlideIndex]?.descriptionText && (
                  <p className="text-xs text-slate-200 leading-snug drop-shadow line-clamp-3">
                    {previewingTemplate.defaultSlides[previewSlideIndex]?.descriptionText}
                  </p>
                )}

                {previewingTemplate.defaultSlides[previewSlideIndex]?.locationDate && (
                  <p className="text-[10px] font-bold text-red-400 border-l-2 border-red-500 pl-2 uppercase">
                    {previewingTemplate.defaultSlides[previewSlideIndex]?.locationDate}
                  </p>
                )}

                <div className="pt-2 flex flex-col items-center justify-center text-white/80 animate-bounce">
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    TAP RIGHT TO ADVANCE · SWIPE UP
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Quick Navigation Indicator */}
            <div className="flex items-center gap-3 text-xs text-white/80">
              <button
                type="button"
                disabled={previewSlideIndex === 0}
                onClick={() => setPreviewSlideIndex((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span>
                Slide {previewSlideIndex + 1} of {previewingTemplate.defaultSlides.length} (Tap Screen to Navigate)
              </span>

              <button
                type="button"
                disabled={previewSlideIndex === previewingTemplate.defaultSlides.length - 1}
                onClick={() =>
                  setPreviewSlideIndex((p) =>
                    Math.min(previewingTemplate.defaultSlides.length - 1, p + 1)
                  )
                }
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
