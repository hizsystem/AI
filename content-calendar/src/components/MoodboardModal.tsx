"use client";

import { useEffect, useRef, useState } from "react";
import type { MoodboardItem } from "@/data/types";

interface MoodboardModalProps {
  moodboard: {
    description?: string;
    items: MoodboardItem[];
  };
  onClose: () => void;
}

export default function MoodboardModal({ moodboard, onClose }: MoodboardModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [fullView, setFullView] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (fullView) {
          setFullView(null);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, fullView]);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex justify-end bg-black/30"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      >
        <div className="bg-white shadow-2xl w-full max-w-[720px] h-full overflow-hidden flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Feed Preview</h2>
              {moodboard.description && (
                <p className="text-[11px] text-gray-400 mt-0.5">{moodboard.description}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Instagram-style 3-column grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {moodboard.items.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {moodboard.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setFullView(item.image)}
                    className="relative aspect-square bg-gray-100 overflow-hidden group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.label || `Feed ${i + 1}`}
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    {item.label && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                        <p className="text-[10px] text-white px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                          {item.label}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300 text-sm">
                무드보드 이미지 준비 중
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {fullView && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 overflow-y-auto cursor-zoom-out"
          onClick={() => setFullView(null)}
        >
          <button
            onClick={() => setFullView(null)}
            className="fixed top-4 right-4 text-white/80 hover:text-white z-[70]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="min-h-full flex items-start justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullView}
              alt="Moodboard full view"
              className="max-w-[95vw] w-auto rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
