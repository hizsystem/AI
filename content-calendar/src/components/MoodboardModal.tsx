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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="bg-white rounded-xl shadow-2xl max-w-[720px] w-full max-h-[85vh] overflow-y-auto">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Visual Moodboard</h2>
            <p className="text-[11px] text-red-500 flex-shrink-0 mt-1">이미지를 클릭하면 전체화면으로 확인할 수 있습니다</p>
          </div>
            {moodboard.description && (
              <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                {moodboard.description}
              </p>
            )}
          </div>

          <div className="p-6">
            {moodboard.items.length > 0 ? (
              <div className={moodboard.items.length === 1 ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {moodboard.items.map((item, i) => (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => setFullView(item.image)}
                      className="w-full text-left"
                    >
                      <div className={`${moodboard.items.length === 1 ? "" : "aspect-square"} bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.label || `Mood ${i + 1}`}
                          className={`w-full ${moodboard.items.length === 1 ? "h-auto object-contain" : "h-full object-cover"}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.classList.add("flex", "items-center", "justify-center");
                            const placeholder = document.createElement("span");
                            placeholder.className = "text-gray-300 text-xs";
                            placeholder.textContent = item.label || "이미지 준비 중";
                            target.parentElement!.appendChild(placeholder);
                          }}
                        />
                      </div>
                    </button>
                    {item.label && (
                      <p className="text-[11px] text-gray-400 mt-1.5 text-center">{item.label}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-300 text-sm">
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
