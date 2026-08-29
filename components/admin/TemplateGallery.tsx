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
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Quote,
  Clock,
  Swords,
  ChefHat,
  Trophy,
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

  const activeSlide = previewingTemplate?.defaultSlides[previewSlideIndex];
  const layoutType = previewingTemplate?.layoutType || "breaking-bold";

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
          Choose from 12 radically distinct editorial layout structures (Split Screen, Giant Rank Numeral, Frosted Glass, Polaroid Frame, 2x2 Infographic, Versus Showdown, Pull Quote, Scoreboard, and more).
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

      {/* Templates 12-Grid */}
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

              {/* Bottom Layout Architecture Tag */}
              <div className="absolute bottom-3 inset-x-3 z-10 space-y-0.5">
                <div className="inline-block px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider border border-white/30">
                  {template.layoutBadge}
                </div>
                <h3 className="text-xs font-black text-white leading-tight drop-shadow line-clamp-1 pt-1">
                  {template.name}
                </h3>
              </div>
            </div>

            {/* Template Info & Action Buttons */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                    {template.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {template.defaultSlides.length} Pgs
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
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
          INTERACTIVE 9:16 LIVE SAMPLE PREVIEW MODAL (RENDERS ALL 12 UNIQUE LAYOUTS)
      ══════════════════════════════════════════════════════════════════════ */}
      {previewingTemplate && activeSlide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in select-none"
          onClick={handleClosePreview}
        >
          <div
            className="relative w-full max-w-[400px] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="w-full flex items-center justify-between text-white px-2">
              <div>
                <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                  Layout: {previewingTemplate.layoutBadge}
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

            {/* 9:16 Mobile Canvas Live Layout Renderer */}
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
              {/* Progress Bars */}
              <div className="relative z-30 space-y-2">
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

              {/* ─── 1. BREAKING BOLD ─── */}
              {layoutType === "breaking-bold" && (
                <>
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" priority />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />
                  <div className="relative z-20 space-y-3 pb-2 mt-auto">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider shadow">
                      {activeSlide.badgeText || "BREAKING NEWS"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-xs text-slate-200 leading-snug drop-shadow line-clamp-3">
                      {activeSlide.descriptionText}
                    </p>
                    <p className="text-[10px] font-bold text-red-400 border-l-2 border-red-500 pl-2 uppercase">
                      {activeSlide.locationDate}
                    </p>
                  </div>
                </>
              )}

              {/* ─── 2. SPLIT SCREEN CARD (50/50) ─── */}
              {layoutType === "split-screen-card" && (
                <div className="absolute inset-0 flex flex-col justify-between bg-[#f7f4ed] text-slate-900 p-4 pt-14">
                  {activeSlide.backgroundMedia && (
                    <div className="relative w-full h-[45%] rounded-2xl overflow-hidden shadow-md border border-slate-300">
                      <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="space-y-2.5 my-auto">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[9px]">
                      {activeSlide.badgeText || "EXPLAINER"}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-slate-950 leading-tight">
                      {activeSlide.headingText}
                    </h3>
                    <div className="w-8 h-1 bg-red-600 rounded-full" />
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                      {activeSlide.descriptionText}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── 3. TOP RANK COUNTDOWN (Giant 01 Numeral) ─── */}
              {layoutType === "top-rank-countdown" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-slate-950 text-white">
                  {/* Giant Numeral Outline */}
                  <div className="absolute right-3 top-10 text-[110px] font-black text-white/10 font-mono select-none pointer-events-none leading-none">
                    {activeSlide.rankNumber || "01"}
                  </div>

                  <div className="relative z-10 space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      {activeSlide.badgeText}
                    </span>
                    <p className="text-[10px] font-bold text-amber-400">{activeSlide.subheadText}</p>
                  </div>

                  {activeSlide.backgroundMedia && (
                    <div className="relative z-10 w-full h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 my-auto">
                      <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                    </div>
                  )}

                  <div className="relative z-10 space-y-1.5 pb-2">
                    <h3 className="text-lg font-black text-white leading-tight">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                      {activeSlide.descriptionText}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── 4. GLASSMORPHISM FLOATING CARD ─── */}
              {layoutType === "glassmorphism-card" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 text-white">
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                  {/* Floating Frosted Glass Card in Center */}
                  <div className="relative z-20 my-auto p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-2.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black text-[8px] uppercase tracking-wider">
                      {activeSlide.badgeText || "NEXT-GEN TECH"}
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-[10px] text-cyan-300 font-mono">{activeSlide.subheadText}</p>
                    <p className="text-xs text-slate-200 leading-snug">
                      {activeSlide.descriptionText}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── 5. POLAROID RETRO FRAME ─── */}
              {layoutType === "polaroid-photo-frame" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-[#f4ede4] text-slate-900">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[8px] uppercase">
                      {activeSlide.badgeText}
                    </span>
                    <h3 className="font-serif font-black text-base text-slate-950 leading-tight">
                      {activeSlide.headingText}
                    </h3>
                  </div>

                  {/* Polaroid Frame with White Border */}
                  <div className="relative my-auto bg-white p-2.5 pb-6 rounded-lg shadow-xl border border-slate-300/60 rotate-[-2deg]">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-200/80 rounded-sm shadow-sm rotate-[4deg]" />
                    <div className="relative w-full h-36 rounded overflow-hidden">
                      {activeSlide.backgroundMedia && (
                        <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono text-center mt-2">
                      {activeSlide.locationDate || "SAN FRANCISCO · MAY 2026"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 leading-snug line-clamp-2">
                    {activeSlide.descriptionText}
                  </p>
                </div>
              )}

              {/* ─── 6. INFOGRAPHIC STATS GRID (2x2) ─── */}
              {layoutType === "infographic-stats-grid" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-[#070d1d] text-white">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                      {activeSlide.badgeText}
                    </span>
                    <h3 className="text-sm font-black text-white">{activeSlide.headingText}</h3>
                  </div>

                  {/* 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 my-auto">
                    {[
                      { icon: Users, color: "text-cyan-400", stat: "272K", label: "Jobs May" },
                      { icon: TrendingUp, color: "text-emerald-400", stat: "3.9%", label: "Unemployment" },
                      { icon: DollarSign, color: "text-amber-400", stat: "4.1%", label: "Wage Growth" },
                      { icon: Briefcase, color: "text-purple-400", stat: "8.1M", label: "Job Openings" },
                    ].map((st, i) => {
                      const Icon = st.icon;
                      return (
                        <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <Icon className={`w-4 h-4 ${st.color}`} />
                          <div className={`text-base font-black ${st.color}`}>{st.stat}</div>
                          <p className="text-[9px] text-slate-300 truncate">{st.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[8px] text-slate-400 text-center">
                    {activeSlide.sourceText || "Source: U.S. Bureau of Labor Statistics"}
                  </p>
                </div>
              )}

              {/* ─── 7. CONNECTED TIMELINE ─── */}
              {layoutType === "connected-timeline" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-[#0d0f15] text-white">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[8px] uppercase flex items-center gap-1 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE TIMELINE
                    </span>
                    <h3 className="text-sm font-black text-white">{activeSlide.headingText}</h3>
                  </div>

                  <div className="border-l-2 border-red-600 pl-3 space-y-3 my-auto">
                    {[
                      { time: "2:45 PM", text: "Severe storms reported in Texas." },
                      { time: "3:30 PM", text: "Tornado warnings issued for 6 states." },
                      { time: "4:10 PM", text: "Over 120,000 customers without power." },
                    ].map((it, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-[8px] font-black text-red-400">{it.time}</span>
                        <p className="text-[10px] text-slate-200">{it.text}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-slate-400">{activeSlide.locationDate}</p>
                </div>
              )}

              {/* ─── 8. BIG QUOTE SPOTLIGHT ─── */}
              {layoutType === "big-quote-spotlight" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-zinc-950 text-white text-center">
                  <span className="text-4xl text-amber-400 font-serif leading-none">“</span>
                  <div className="space-y-3 my-auto">
                    {activeSlide.backgroundMedia && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto ring-4 ring-amber-400/30">
                        <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <h3 className="font-serif italic text-base font-bold text-white px-2">
                      {activeSlide.headingText}
                    </h3>
                    <p className="text-xs text-amber-400 font-bold not-italic">
                      {activeSlide.quoteAuthor}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400">{activeSlide.descriptionText}</p>
                </div>
              )}

              {/* ─── 9. VERSUS COMPARISON (A vs B) ─── */}
              {layoutType === "versus-comparison" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-zinc-950 text-white">
                  <div className="text-center space-y-1">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[8px] uppercase">
                      HEAD-TO-HEAD
                    </span>
                    <h3 className="text-sm font-black">{activeSlide.headingText}</h3>
                  </div>

                  {/* Dual A vs B Cards */}
                  <div className="relative space-y-2 my-auto">
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-300">Quantum Neural</span>
                        <span className="text-sm font-black text-cyan-400">100 TOPS</span>
                      </div>
                      <p className="text-[9px] text-slate-300">5W Power · 0ms Cloud Delay</p>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-black shadow">
                      VS
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-300">Traditional GPU</span>
                        <span className="text-sm font-black text-purple-400">45 TOPS</span>
                      </div>
                      <p className="text-[9px] text-slate-300">35W Power · Cloud Lag</p>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center">{activeSlide.descriptionText}</p>
                </div>
              )}

              {/* ─── 10. MAGAZINE EDITORIAL CUTOUT ─── */}
              {layoutType === "magazine-cutout" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-black text-white">
                  {activeSlide.backgroundMedia && (
                    <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/20 to-black/60 pointer-events-none" />

                  <div className="relative z-10 space-y-1">
                    <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-black text-[8px] uppercase">
                      {activeSlide.badgeText}
                    </span>
                    <h3 className="font-serif font-black text-3xl text-white leading-none mt-1">
                      {activeSlide.headingText}
                    </h3>
                    <p className="font-serif italic text-xs text-pink-400">{activeSlide.subheadText}</p>
                  </div>

                  <div className="relative z-10 space-y-2 pb-2">
                    <p className="text-xs text-slate-200 line-clamp-2">{activeSlide.descriptionText}</p>
                    <div className="py-2 px-3 rounded-full bg-purple-600 text-white text-[9px] font-bold text-center">
                      SWIPE UP FOR INTERVIEW
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 11. RECIPE & STEP-BY-STEP CHECKLIST ─── */}
              {layoutType === "recipe-step-card" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-[#160d09] text-amber-100">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-rose-700 text-white font-black text-[8px] uppercase">
                      {activeSlide.badgeText}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-white">{activeSlide.headingText}</h3>
                  </div>

                  {activeSlide.backgroundMedia && (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-amber-500/30 my-auto">
                      <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="space-y-1.5 my-auto">
                    {[
                      { num: "01", text: "Boil pasta 90s in salted water." },
                      { num: "02", text: "Swirl butter with starchy pasta water." },
                      { num: "03", text: "Plate & finish with shaved Alba truffles." },
                    ].map((step, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] flex items-center justify-center">
                          {step.num}
                        </span>
                        <span className="text-[10px] text-slate-200">{step.text}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-amber-300/80">{activeSlide.subheadText}</p>
                </div>
              )}

              {/* ─── 12. SPORTS SCOREBOARD & MVP ─── */}
              {layoutType === "sports-scoreboard" && (
                <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 bg-[#0a0d18] text-white">
                  {/* Top Stadium Scoreboard Box */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider block">FINALS GAME 7</span>
                      <span className="text-sm font-black font-mono">LAL 114</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[9px] font-black">OT FINAL</span>
                    <div className="text-right">
                      <span className="text-[8px] font-black uppercase tracking-wider block">EAST</span>
                      <span className="text-sm font-black font-mono">108 BOS</span>
                    </div>
                  </div>

                  {activeSlide.backgroundMedia && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 my-auto">
                      <Image src={activeSlide.backgroundMedia} alt="" fill className="object-cover" />
                    </div>
                  )}

                  <div className="space-y-1.5 pb-2">
                    <h3 className="text-xs font-black text-white">{activeSlide.headingText}</h3>
                    {/* MVP Stat Row */}
                    <div className="flex gap-2">
                      <div className="flex-1 p-1.5 rounded-lg bg-white/10 text-center">
                        <span className="text-xs font-black text-orange-400 block">44</span>
                        <span className="text-[7px] uppercase text-slate-400">PTS</span>
                      </div>
                      <div className="flex-1 p-1.5 rounded-lg bg-white/10 text-center">
                        <span className="text-xs font-black text-orange-400 block">12</span>
                        <span className="text-[7px] uppercase text-slate-400">REB</span>
                      </div>
                      <div className="flex-1 p-1.5 rounded-lg bg-white/10 text-center">
                        <span className="text-xs font-black text-orange-400 block">8</span>
                        <span className="text-[7px] uppercase text-slate-400">AST</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Bounce */}
              <div className="relative z-20 pt-1 flex flex-col items-center justify-center text-white/80 animate-bounce">
                <ChevronUp className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase tracking-widest">
                  TAP RIGHT TO ADVANCE
                </span>
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
                Slide {previewSlideIndex + 1} of {previewingTemplate.defaultSlides.length} (Tap Canvas to Navigate)
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
