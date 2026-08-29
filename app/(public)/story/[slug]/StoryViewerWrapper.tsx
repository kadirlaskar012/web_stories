"use client";
import { useState } from "react";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryPage, StoryElement } from "@prisma/client";
import { Play } from "lucide-react";

type PageWithElements = StoryPage & { elements: StoryElement[] };

interface Props {
  pages: PageWithElements[];
  title: string;
  authorName: string;
  publisherName: string;
}

export default function StoryViewerWrapper({ pages, title, authorName, publisherName }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
        <p className="text-gray-500 text-sm">This story has no pages yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Inline viewer */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
        style={{ maxWidth: "360px" }}
        onClick={() => setFullscreen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setFullscreen(true)}
        aria-label="Open story fullscreen"
      >
        <div className="relative aspect-[9/16]">
          <StoryViewer
            pages={pages}
            title={title}
            authorName={authorName}
            publisherName={publisherName}
            showCloseButton={false}
          />
          {/* Fullscreen hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <Play className="w-4 h-4" />
              View Fullscreen
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Story: ${title}`}
        >
          <StoryViewer
            pages={pages}
            title={title}
            authorName={authorName}
            publisherName={publisherName}
            onClose={() => setFullscreen(false)}
            showCloseButton={true}
          />
        </div>
      )}
    </>
  );
}
