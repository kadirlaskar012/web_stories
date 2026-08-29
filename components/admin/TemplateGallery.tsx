"use client";
import React, { useState } from "react";
import Image from "next/image";
import { STORY_TEMPLATES, StoryTemplatePreset } from "@/lib/themes/templates";
import {
  Flame,
  BookOpen,
  Camera,
  BarChart3,
  Radio,
  Sparkles,
  ArrowRight,
  Plus,
  Layers,
  Sparkle,
  Check,
} from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate: (template: StoryTemplatePreset) => void;
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "News & Politics",
    "Editorial & Feature",
    "Economy & Tech",
    "Travel & Photography",
    "Entertainment & Culture",
  ];

  const filteredTemplates =
    selectedCategory === "All"
      ? STORY_TEMPLATES
      : STORY_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Gallery Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-black text-xs uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 · Choose Your Story Template</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Select a Web Story Design
        </h1>
        <p className="text-sm text-slate-500">
          Pick a signature American digital newsroom layout. Your story will adopt this consistent, high-impact editorial style across all slides.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              selectedCategory === cat
                ? "bg-slate-950 text-white shadow-lg scale-105"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 shadow-sm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="group cursor-pointer rounded-3xl bg-white border-2 border-slate-200/90 hover:border-red-600 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top 9:16 Thumbnail Card */}
            <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
              {template.coverImage ? (
                <Image
                  src={template.coverImage}
                  alt={template.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-cyan-400 opacity-60" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-white font-black text-[10px] uppercase tracking-wider shadow ${template.badgeColor}`}>
                  {template.badge}
                </span>
              </div>

              {/* Bottom Preview Title */}
              <div className="absolute bottom-3 inset-x-3 z-10 space-y-1">
                <p className="text-[10px] font-bold uppercase text-red-400 tracking-wider">
                  {template.category}
                </p>
                <h3 className="text-sm font-black text-white leading-tight drop-shadow line-clamp-2">
                  {template.defaultTitle}
                </h3>
              </div>
            </div>

            {/* Template Info & Action Button */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-base text-slate-900 group-hover:text-red-600 transition-colors">
                    {template.name}
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {template.defaultSlides.length} Slides
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Select Button */}
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 group-hover:bg-red-600 text-white font-black text-xs shadow-md group-hover:shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
