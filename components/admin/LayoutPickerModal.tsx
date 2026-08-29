"use client";
import React, { useState } from "react";
import Image from "next/image";
import { SLIDE_LAYOUTS, SlideLayoutConfig, SlideLayoutType } from "@/lib/themes/layouts";
import { X, Check, Eye } from "lucide-react";

interface LayoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layout: SlideLayoutConfig) => void;
  currentLayoutId?: SlideLayoutType;
}

export function LayoutPickerModal({
  isOpen,
  onClose,
  onSelectLayout,
  currentLayoutId = "breaking-bold",
}: LayoutPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const categories = [
    "All",
    "News & Politics",
    "Editorial & Feature",
    "Economy & Tech",
    "Travel & Lifestyle",
    "Entertainment & Sports",
  ];

  const filtered =
    selectedCategory === "All"
      ? SLIDE_LAYOUTS
      : SLIDE_LAYOUTS.filter((l) => l.category === selectedCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Choose Slide Layout Architecture</h2>
            <p className="text-xs text-slate-500">Pick a structural layout for this slide</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((layout) => {
            const isSelected = currentLayoutId === layout.id;
            return (
              <div
                key={layout.id}
                onClick={() => {
                  onSelectLayout(layout);
                  onClose();
                }}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-red-600 bg-red-50/30 ring-2 ring-red-500/20 shadow-md"
                    : "border-slate-200 hover:border-slate-400 hover:shadow-sm"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-red-600 uppercase">{layout.category}</span>
                    {isSelected && <Check className="w-4 h-4 text-red-600" />}
                  </div>
                  <h3 className="font-black text-sm text-slate-900">{layout.name}</h3>
                  <p className="text-xs text-slate-500">{layout.structureDescription}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
