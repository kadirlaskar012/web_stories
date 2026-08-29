"use client";
import React, { useState } from "react";
import { SLIDE_LAYOUTS, SlideLayoutConfig, SlideLayoutType } from "@/lib/themes/layouts";
import { X, LayoutGrid, Flame, BookOpen, Camera, BarChart3, Radio, Sparkles, Quote, Send } from "lucide-react";

interface LayoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layout: SlideLayoutConfig) => void;
  currentLayoutId?: SlideLayoutType;
  titleText?: string;
}

export function LayoutPickerModal({
  isOpen,
  onClose,
  onSelectLayout,
  currentLayoutId,
  titleText = "Choose USA News Web Story Layout",
}: LayoutPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const categories = ["All", "USA News", "Editorial", "Data & Live", "Culture & Action"];
  const filteredLayouts =
    selectedCategory === "All"
      ? SLIDE_LAYOUTS
      : SLIDE_LAYOUTS.filter((l) => l.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fade-in text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black">
              USA
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{titleText}</h2>
              <p className="text-xs text-slate-400">
                Inspired by top American digital news publications & mobile editorial standards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredLayouts.map((layout) => {
            const isCurrent = currentLayoutId === layout.id;
            return (
              <div
                key={layout.id}
                onClick={() => {
                  onSelectLayout(layout);
                  onClose();
                }}
                className={`group cursor-pointer rounded-2xl border-2 p-3 bg-slate-900/60 hover:bg-slate-850 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? "border-red-500 ring-2 ring-red-500/30 bg-red-950/20"
                    : "border-slate-800 hover:border-slate-600 hover:scale-[1.02]"
                }`}
              >
                {/* 9:16 Miniature Wireframe Representation */}
                <div className="w-full aspect-[9/16] rounded-xl overflow-hidden relative shadow-inner mb-3 border border-slate-800 flex flex-col justify-between p-3 select-none">
                  {/* 1. BREAKING NEWS */}
                  {layout.id === "breaking-news" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <div className="px-1.5 py-0.5 rounded bg-red-600 text-[7px] font-black text-white">
                          USA DAILY
                        </div>
                        <span className="text-[7px] text-slate-300">2h ago</span>
                      </div>

                      <div className="space-y-1 mt-auto">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[6px] uppercase tracking-wider">
                          BREAKING NEWS
                        </span>
                        <div className="text-[10px] font-black uppercase text-white leading-tight">
                          MASSIVE WILDFIRE HITS CALIFORNIA
                        </div>
                        <p className="text-[7px] text-slate-300 line-clamp-1">
                          Thousands evacuated as firefighters battle blaze
                        </p>
                        <div className="text-[6px] text-red-400 font-bold border-l-2 border-red-500 pl-1">
                          JUNE 1, 2024 | CALIFORNIA, USA
                        </div>
                        <div className="text-center pt-1 text-[6px] text-slate-400 uppercase font-bold">
                          ^ SWIPE UP FOR MORE
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. NEWS EXPLAINER */}
                  {layout.id === "news-explainer" && (
                    <div className="absolute inset-0 bg-[#f7f4ed] text-slate-900 p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[7px] font-bold text-slate-600">
                        <span>01 / 07</span>
                        <span className="font-black">USADAILY</span>
                      </div>

                      <div className="space-y-1.5 mt-1">
                        <h4 className="font-serif font-bold text-[10px] text-slate-950 leading-tight">
                          What You Need to Know About The New Student Loan Plan
                        </h4>
                        <div className="w-5 h-0.5 bg-red-600 rounded-full" />
                        <p className="text-[6.5px] text-slate-700 leading-tight">
                          The U.S. Dept of Education announced a major update to loan forgiveness.
                        </p>
                      </div>

                      <div className="h-16 w-full rounded-md bg-slate-300/80 border border-slate-400/40 flex items-center justify-center text-[7px] text-slate-600 font-bold">
                        Editorial Photo Frame
                      </div>

                      <div className="text-center text-[6px] text-slate-500 font-bold uppercase">
                        ^ SWIPE UP
                      </div>
                    </div>
                  )}

                  {/* 3. PHOTO NEWS */}
                  {layout.id === "photo-news" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <div className="h-0.5 w-8 rounded-full bg-white" />
                        <span className="text-[7px] text-white/80">USADAILY</span>
                      </div>

                      <div className="space-y-1 mt-auto">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[6px] uppercase">
                          U.S. NEWS
                        </span>
                        <div className="font-serif font-bold text-[11px] text-white leading-tight">
                          Foggy Morning in San Francisco
                        </div>
                        <p className="text-[7px] text-slate-200">
                          A beautiful start to the day in the Bay Area.
                        </p>
                        <div className="text-center pt-1 text-[6px] text-slate-400 uppercase font-bold">
                          ^ SWIPE UP
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. DATA / FACTS */}
                  {layout.id === "data-facts" && (
                    <div className="absolute inset-0 bg-[#070d1d] p-3 flex flex-col justify-between text-white">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[6px] uppercase tracking-wider">
                          U.S. ECONOMY UPDATE
                        </span>
                        <div className="text-[9px] font-bold text-white mt-1">
                          May Jobs Report Key Highlights
                        </div>
                      </div>

                      <div className="space-y-1 my-auto">
                        <div className="p-1 rounded bg-white/5 border border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-black text-cyan-400">272K</span>
                          <span className="text-[6px] text-slate-300">Jobs added</span>
                        </div>
                        <div className="p-1 rounded bg-white/5 border border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-black text-emerald-400">3.9%</span>
                          <span className="text-[6px] text-slate-300">Unemployment</span>
                        </div>
                        <div className="p-1 rounded bg-white/5 border border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-black text-amber-400">4.1%</span>
                          <span className="text-[6px] text-slate-300">Avg Hourly</span>
                        </div>
                        <div className="p-1 rounded bg-white/5 border border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-black text-purple-400">8.1M</span>
                          <span className="text-[6px] text-slate-300">Job Openings</span>
                        </div>
                      </div>

                      <div className="text-center text-[5.5px] text-slate-400">
                        Source: U.S. Bureau of Labor Statistics
                      </div>
                    </div>
                  )}

                  {/* 5. LIVE UPDATE */}
                  {layout.id === "live-update" && (
                    <div className="absolute inset-0 bg-[#0d0f15] p-3 flex flex-col justify-between text-white">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[6px] uppercase">
                          🔴 LIVE UPDATE
                        </span>
                        <div className="text-[9px] font-bold text-white mt-0.5">
                          What We Know So Far
                        </div>
                        <div className="text-[6px] text-slate-400">May 31, 2024</div>
                      </div>

                      {/* Timeline Wireframe */}
                      <div className="border-l-2 border-red-600 pl-2 space-y-1.5 my-auto">
                        <div>
                          <span className="text-[6px] font-bold text-red-400">2:45 PM</span>
                          <p className="text-[6px] text-slate-300 leading-tight">Severe storms in TX & OK.</p>
                        </div>
                        <div>
                          <span className="text-[6px] font-bold text-red-400">3:30 PM</span>
                          <p className="text-[6px] text-slate-300 leading-tight">Tornado warnings 6 states.</p>
                        </div>
                        <div>
                          <span className="text-[6px] font-bold text-red-400">4:10 PM</span>
                          <p className="text-[6px] text-slate-300 leading-tight">120K power outages.</p>
                        </div>
                      </div>

                      <div className="text-center text-[6px] text-slate-400 font-bold uppercase">
                        ^ SWIPE UP FOR MORE
                      </div>
                    </div>
                  )}

                  {/* 6. ENTERTAINMENT */}
                  {layout.id === "entertainment-magazine" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/40 to-black p-3 flex flex-col justify-between text-white">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-purple-600 text-white font-black text-[6px] uppercase tracking-wider">
                          ENTERTAINMENT
                        </span>
                        <h4 className="font-serif font-black text-base text-white mt-1 leading-none">
                          Zendaya
                        </h4>
                        <div className="text-[7.5px] italic text-pink-400 font-serif">
                          Stars in New Blockbuster
                        </div>
                      </div>

                      <div className="space-y-1 mt-auto">
                        <p className="text-[6.5px] text-slate-300">
                          Everything we know about the highly anticipated film.
                        </p>
                        <div className="p-1 rounded-full bg-purple-600/80 text-white text-[6.5px] font-bold text-center">
                          → SWIPE UP FOR DETAILS
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. QUOTE SPOTLIGHT */}
                  {layout.id === "quote-spotlight" && (
                    <div className="absolute inset-0 bg-slate-950 p-3 flex flex-col justify-between text-center text-white">
                      <div className="text-2xl text-amber-400/80 font-serif leading-none mt-2">“</div>
                      <p className="font-serif italic text-[8.5px] text-white leading-tight px-1">
                        We are committed to delivering swift relief to working families across the country.
                      </p>
                      <cite className="text-[6px] font-bold text-amber-400 uppercase not-italic mb-2">
                        — White House Press Secretary
                      </cite>
                    </div>
                  )}

                  {/* 8. CTA FINALE */}
                  {layout.id === "cta-finale" && (
                    <div className="absolute inset-0 bg-[#090d16] p-3 flex flex-col justify-between text-center text-white">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[6px] uppercase mx-auto">
                        STAY INFORMED
                      </span>
                      <div className="space-y-1 my-auto">
                        <h4 className="text-[9.5px] font-black text-white leading-tight">
                          Follow Live Coverage on USA Daily
                        </h4>
                        <p className="text-[6.5px] text-slate-300">
                          Get real-time breaking alerts and in-depth visual journalism.
                        </p>
                      </div>
                      <div className="py-1 rounded-full bg-red-600 text-white text-[7px] font-bold">
                        Read Full Investigation →
                      </div>
                    </div>
                  )}
                </div>

                {/* Info & Select Button */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors">
                      {layout.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {layout.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
