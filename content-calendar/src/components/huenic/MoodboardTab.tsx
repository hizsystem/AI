"use client";

import { useState, useMemo, useCallback } from "react";
import { useCalendarData } from "@/hooks/useCalendarData";
import type { HuenicBrand } from "@/data/huenic-types";
import type { ContentItem } from "@/data/types";
import InstagramGrid from "./InstagramGrid";
import BrandMoodboard from "./BrandMoodboard";
import ContentModal from "@/components/ContentModal";

const AVAILABLE_MONTHS = ["2026-03", "2026-04", "2026-05"];

function getCurrentMonth(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (AVAILABLE_MONTHS.includes(ym)) return ym;
  const future = AVAILABLE_MONTHS.filter((m) => m >= ym);
  if (future.length > 0) return future[0];
  return AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1];
}

interface MoodboardTabProps {
  brand: HuenicBrand;
}

export default function MoodboardTab({ brand }: MoodboardTabProps) {
  const client = `huenic-${brand}`;
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth
  );
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const { data, loading, error, saveCalendar } = useCalendarData(
    client,
    currentMonth
  );

  // Sort items by date descending (newest first, like Instagram)
  const sortedItems = useMemo(() => {
    if (!data) return [];
    return [...data.items].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const categoryMap = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.categories.map((c) => [c.id, c]));
  }, [data]);

  // Moodboard images from CalendarData.moodboard
  const moodboardImages = useMemo(() => {
    if (!data?.moodboard?.items) return [];
    return data.moodboard.items.map((item) => ({
      url: item.image,
      label: item.label,
    }));
  }, [data]);

  const handleMoodboardSave = useCallback(
    async (
      images: { url: string; label?: string }[]
    ) => {
      if (!saveCalendar) return;
      await saveCalendar({
        moodboard: {
          description: data?.moodboard?.description,
          items: images.map((img) => ({
            image: img.url,
            label: img.label,
          })),
        },
      });
    },
    [saveCalendar, data?.moodboard?.description]
  );

  const handleGridReorder = useCallback(
    async (reorderedItems: ContentItem[]) => {
      if (!saveCalendar || !data) return;
      // Reassign dates based on new order to maintain grid arrangement
      // For now, just save the reordered array (order is visual only in grid)
      await saveCalendar({ items: reorderedItems });
    },
    [saveCalendar, data]
  );

  // Parse month for display
  const [yearStr, monthStr] = currentMonth.split("-");
  const monthNames = [
    "",
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  const displayMonth = `${yearStr}년 ${monthNames[Number(monthStr)]}`;

  // Month navigation
  const monthIdx = AVAILABLE_MONTHS.indexOf(currentMonth);
  const handlePrevMonth = () => {
    if (monthIdx > 0) setCurrentMonth(AVAILABLE_MONTHS[monthIdx - 1]);
  };
  const handleNextMonth = () => {
    if (monthIdx < AVAILABLE_MONTHS.length - 1)
      setCurrentMonth(AVAILABLE_MONTHS[monthIdx + 1]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">무드보드 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">{error || `${currentMonth} 데이터가 아직 없습니다`}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header: month nav + edit toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            disabled={monthIdx <= 0}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {displayMonth}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={monthIdx >= AVAILABLE_MONTHS.length - 1}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setEditMode((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
            editMode
              ? "border-blue-400 bg-blue-50 text-blue-600"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {editMode ? "편집 중" : "편집"}
        </button>
      </div>

      {/* Section 1: Brand Moodboard */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          비주얼 무드보드
        </h2>
        <BrandMoodboard
          images={moodboardImages}
          editMode={editMode}
          onSave={handleMoodboardSave}
        />
      </section>

      {/* Section 2: Instagram Grid Preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Instagram Grid Preview
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              업로드 완료
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              컨펌 필요
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              기획
            </span>
          </div>
        </div>

        {/* Instagram phone frame */}
        <div className="max-w-md mx-auto">
          {/* Profile header mock */}
          <div className="border border-gray-200 rounded-t-xl bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand === "veggiet" ? "/content/veggiet-profile.jpg" : "/content/vinker-profile.jpg"}
                alt={brand === "veggiet" ? "veggiet" : "vinker"}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const fallback = el.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-10 h-10 rounded-full items-center justify-center text-white text-xs font-bold hidden"
                style={{
                  backgroundColor:
                    brand === "veggiet" ? "#10b981" : "#8b5cf6",
                }}
              >
                {brand === "veggiet" ? "V" : "VK"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {brand === "veggiet" ? "veggiet_official" : "vinker_official"}
                </p>
                <p className="text-xs text-gray-400">
                  {sortedItems.length} posts
                </p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <InstagramGrid
            items={sortedItems}
            categories={data.categories}
            editMode={editMode}
            onReorder={handleGridReorder}
            onItemClick={(item) => setSelectedItem(item)}
          />

          {/* Bottom rounded corners */}
          <div className="h-3 border-x border-b border-gray-200 rounded-b-xl bg-white" />
        </div>

        {editMode && (
          <p className="text-center text-xs text-gray-400 mt-3">
            드래그하여 그리드 순서를 조정할 수 있습니다. 캘린더에서 콘텐츠를
            추가/수정하면 자동 반영됩니다.
          </p>
        )}
      </section>

      {/* Content Detail Modal */}
      {selectedItem && (
        <ContentModal
          item={selectedItem}
          category={categoryMap[selectedItem.category]}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
