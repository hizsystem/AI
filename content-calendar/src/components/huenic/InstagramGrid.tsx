"use client";

import { useState, useCallback } from "react";
import type { ContentItem, Category } from "@/data/types";

interface InstagramGridProps {
  items: ContentItem[];
  categories: Category[];
  editMode?: boolean;
  onReorder?: (items: ContentItem[]) => void;
  onItemClick?: (item: ContentItem) => void;
}

export default function InstagramGrid({
  items,
  categories,
  editMode = false,
  onReorder,
  onItemClick,
}: InstagramGridProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      if (dragIdx === null) return;
      e.preventDefault();
      setDropIdx(idx);
    },
    [dragIdx]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIdx: number) => {
      e.preventDefault();
      setDropIdx(null);
      if (dragIdx === null || dragIdx === targetIdx || !onReorder) return;

      const reordered = [...items];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(targetIdx, 0, moved);
      onReorder(reordered);
      setDragIdx(null);
    },
    [dragIdx, items, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDropIdx(null);
  }, []);

  const statusDot: Record<string, string> = {
    uploaded: "bg-emerald-400",
    "needs-confirm": "bg-amber-400",
    planning: "bg-gray-300",
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        캘린더에 콘텐츠를 추가하면 그리드에 자동 반영됩니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-gray-100 border-x border-b border-gray-200 overflow-hidden">
      {items.map((item, idx) => {
        const cat = categoryMap[item.category];
        const hasImage =
          item.overview.images && item.overview.images.length > 0;
        const isDragging = dragIdx === idx;
        const isDropTarget = dropIdx === idx;

        return (
          <div
            key={item.id}
            draggable={editMode}
            onDragStart={() => editMode && handleDragStart(idx)}
            onDragOver={(e) => editMode && handleDragOver(e, idx)}
            onDrop={(e) => editMode && handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => onItemClick?.(item)}
            style={{ aspectRatio: "4 / 5" }}
            className={`relative cursor-pointer transition-all overflow-hidden ${
              isDragging ? "opacity-30 scale-95" : ""
            } ${isDropTarget ? "ring-2 ring-inset ring-blue-400" : ""} ${
              editMode ? "cursor-grab active:cursor-grabbing" : ""
            }`}
          >
            {/* Background: image or category color */}
            {hasImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.overview.images![0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: cat ? `${cat.color}15` : "#f9fafb",
                }}
              >
                {/* Category icon placeholder */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: cat ? `${cat.color}25` : "#e5e7eb",
                  }}
                >
                  <span
                    className="text-lg"
                    style={{ color: cat?.color || "#9ca3af" }}
                  >
                    {item.category === "recipe"
                      ? "🍽"
                      : item.category === "branding"
                      ? "✦"
                      : item.category === "reels"
                      ? "▶"
                      : item.category === "seeding"
                      ? "🤝"
                      : "◻"}
                  </span>
                </div>
              </div>
            )}

            {/* Overlay: title + date + status */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-2">
              <p className="text-[10px] text-white/70 leading-tight">
                {item.date.split("-").slice(1).join("/")}
              </p>
              <p className="text-xs text-white font-medium leading-tight truncate">
                {item.title}
              </p>
            </div>

            {/* Status dot */}
            {item.status && (
              <div className="absolute top-1.5 right-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusDot[item.status] || "bg-gray-300"
                  }`}
                  title={
                    item.status === "uploaded"
                      ? "업로드 완료"
                      : item.status === "needs-confirm"
                      ? "컨펌 필요"
                      : "기획"
                  }
                />
              </div>
            )}

            {/* Category badge */}
            <div className="absolute top-1.5 left-1.5">
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white/90"
                style={{ backgroundColor: cat ? `${cat.color}cc` : "#6b7280" }}
              >
                {cat?.name || item.category}
              </span>
            </div>

            {/* Edit mode: drag handle */}
            {editMode && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white/80 rounded-lg px-3 py-1.5 text-xs text-gray-600 font-medium shadow">
                  드래그하여 이동
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
