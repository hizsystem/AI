"use client";

import { useEffect, useRef } from "react";
import type { ContentItem, Category, ContentStatus } from "@/data/types";

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  planning: { label: "기획", bg: "bg-gray-100", text: "text-gray-500" },
  "needs-confirm": { label: "컨펌 필요", bg: "bg-amber-50", text: "text-amber-600" },
  uploaded: { label: "업로드 완료", bg: "bg-emerald-50", text: "text-emerald-600" },
};

interface ContentModalProps {
  item: ContentItem;
  category: Category;
  onClose: () => void;
  onEdit?: (item: ContentItem) => void;
}

export default function ContentModal({
  item,
  category,
  onClose,
  onEdit,
}: ContentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const { overview } = item;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Instagram-style container */}
      <div className="bg-white shadow-2xl flex max-w-[860px] w-full max-h-[80vh] overflow-hidden rounded">
        {/* Left: Media area — min-h prevents collapse, object-contain keeps ratio */}
        <div className="w-[420px] min-h-[320px] bg-gray-950 flex-shrink-0 flex items-center justify-center self-stretch">
          {overview.localVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={overview.localVideo}
                poster={overview.images?.[0]}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
              <div className="absolute bottom-12 right-2 bg-black/80 text-white text-[10px] px-2.5 py-1 rounded-full pointer-events-none animate-pulse">
                전체화면으로 확인하세요
              </div>
            </div>
          ) : overview.videoUrl && isEmbeddable(overview.videoUrl) ? (
            <iframe
              src={toEmbedUrl(overview.videoUrl)}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : overview.videoUrl && !isEmbeddable(overview.videoUrl) ? (
            <a
              href={overview.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex flex-col items-center justify-center gap-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M10 8l6 4-6 4V8z" fill="white"/>
                </svg>
              </div>
              <span className="text-white/50 text-[11px] tracking-wide">Instagram에서 보기</span>
            </a>
          ) : overview.images && overview.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overview.images[0]}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <FormatIcon format={overview.format} color={category.color} />
              </div>
              <span className="text-white/30 text-[11px] tracking-wide">
                {overview.format || "PREVIEW"}
              </span>
            </div>
          )}
        </div>

        {/* Right: Content area */}
        <div className="flex-1 flex flex-col min-w-0 w-[440px]">

          {/* Profile header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tsb-logo.png" alt="TSB" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 leading-none">tap.shop.bar</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-medium text-white tracking-wide"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
              {onEdit && (
                <button
                  onClick={() => { onClose(); onEdit(item); }}
                  className="px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors"
                  title="수정"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  수정
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* Title + Date */}
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[11px] text-gray-400 tracking-wide">
                {formatDate(item.date)}
                {overview.format && <span className="ml-2 text-gray-300">|</span>}
                {overview.format && <span className="ml-2">{overview.format}</span>}
              </p>
              {item.status && STATUS_CONFIG[item.status] && (
                <span className={`px-1.5 py-px rounded text-[9px] font-medium ${STATUS_CONFIG[item.status].bg} ${STATUS_CONFIG[item.status].text}`}>
                  {STATUS_CONFIG[item.status].label}
                </span>
              )}
            </div>

            {/* Caption draft */}
            {overview.caption && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Caption
                </p>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-gray-700 whitespace-pre-line leading-[1.8]">
                    {overview.caption}
                  </p>
                </div>
              </div>
            )}

            {/* Hashtags */}
            {overview.hashtags && overview.hashtags.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Hashtags
                </p>
                <p className="text-[12px] text-blue-400 leading-relaxed">
                  {overview.hashtags.join("  ")}
                </p>
              </div>
            )}

            {/* Mentions */}
            {overview.mentions && overview.mentions.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Mentions
                </p>
                <p className="text-[12px] text-blue-400">
                  {overview.mentions.join("  ")}
                </p>
              </div>
            )}

          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M22 3L9.218 10.083M11.698 20.334L22 3.001H2L9.218 10.084 11.698 20.334z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="flex-1" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M17 3H7a2 2 0 00-2 2v14l7-3 7 3V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}

function FormatIcon({ format, color }: { format?: string; color: string }) {
  if (format?.includes("릴스")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke={color} strokeWidth="1.5"/>
        <path d="M10 8l6 4-6 4V8z" fill={color}/>
      </svg>
    );
  }
  if (format?.includes("캐러셀") || format?.includes("카드뉴스")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth="1.5"/>
        <rect x="7" y="3" width="14" height="14" rx="2" stroke={color} strokeWidth="1.5" opacity="0.4"/>
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
      <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function isEmbeddable(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("youtube.com") || u.hostname === "youtu.be";
  } catch {
    return false;
  }
}

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${u.pathname.split("/shorts/")[1]}`;
      }
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    // Instagram reel
    if (u.hostname.includes("instagram.com") && u.pathname.includes("/reel/")) {
      const reelId = u.pathname.split("/reel/")[1].replace(/\/$/, "");
      return `https://www.instagram.com/reel/${reelId}/embed/`;
    }
  } catch {
    return url;
  }
  return url;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${y}.${m}.${d} (${weekdays[date.getDay()]})`;
}
