"use client";
import { useState } from "react";
import { StoryViewer, NextStoryInfo } from "@/components/story/StoryViewer";
import { StoryPage, StoryElement } from "@prisma/client";
import { Play, Maximize2 } from "lucide-react";

type PageWithElements = StoryPage & { elements: StoryElement[] };

interface Props {
  pages: PageWithElements[];
  storyId?: string;
  title: string;
  authorName: string;
  publisherName: string;
  nextStory?: NextStoryInfo | null;
}

export default function StoryViewerWrapper({
  pages,
  storyId,
  title,
  authorName,
  publisherName,
  nextStory,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-xs font-bold">This visual story has no slides yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* 9:16 Canvas Viewer */}
      <div className="w-full h-full relative group">
        <StoryViewer
          pages={pages}
          storyId={storyId}
          title={title}
          authorName={authorName}
          publisherName={publisherName}
          nextStory={nextStory}
          showCloseButton={false}
        />

        {/* Fullscreen Trigger Pill (Top Right) */}
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute top-12 right-4 z-40 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black text-white text-[10px] font-bold backdrop-blur-md border border-white/20 shadow flex items-center gap-1 transition-all hover:scale-105"
          aria-label="Expand Fullscreen"
        >
          <Maximize2 className="w-3 h-3 text-amber-300" />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>

      {/* Fullscreen Modal Overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Story: ${title}`}
        >
          <StoryViewer
            pages={pages}
            storyId={storyId}
            title={title}
            authorName={authorName}
            publisherName={publisherName}
            nextStory={nextStory}
            onClose={() => setFullscreen(false)}
            showCloseButton={true}
          />
        </div>
      )}
    </>
  );
}
