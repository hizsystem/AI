"use client";

import { useState, useEffect, useCallback as useCallbackReact, useMemo, useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCalendarData } from "@/hooks/useCalendarData";
import type { HuenicBrand } from "@/data/huenic-types";
import type { ContentItem } from "@/data/types";
import InstagramGrid from "./InstagramGrid";
import ContentModal from "@/components/ContentModal";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface MoodboardTabProps {
  brand: HuenicBrand;
}

export default function MoodboardTab({ brand }: MoodboardTabProps) {
  const client = `huenic-${brand}`;
  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");

  const fetchMonths = useCallbackReact(async () => {
    try {
      const res = await fetch(`/api/calendar-months/${client}`);
      if (res.ok) {
        const { months: m } = await res.json();
        setMonths(m);
        if (m.length > 0 && !currentMonth) {
          const now = getCurrentMonth();
          setCurrentMonth(m.includes(now) ? now : m[m.length - 1]);
        }
      }
    } catch {
      // fallback
    }
  }, [client, currentMonth]);

  useEffect(() => { fetchMonths(); }, [fetchMonths]);
  useEffect(() => { setCurrentMonth(""); setMonths([]); }, [brand]);
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
  const monthIdx = months.indexOf(currentMonth);
  const handlePrevMonth = () => {
    if (monthIdx > 0) setCurrentMonth(months[monthIdx - 1]);
  };
  const handleNextMonth = () => {
    if (monthIdx < months.length - 1)
      setCurrentMonth(months[monthIdx + 1]);
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
            disabled={monthIdx >= months.length - 1}
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

      {/* Instagram Profile Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
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

        {/* Instagram profile frame */}
        <div className="max-w-2xl mx-auto border border-gray-200 rounded-2xl bg-white overflow-hidden">
          {/* Profile header */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-5">
              {/* Profile pic */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ring-2 ring-offset-2 ${
                  brand === "veggiet" ? "bg-emerald-500 ring-emerald-500" : "bg-purple-500 ring-purple-500"
                }`}
              >
                {brand === "veggiet" ? "🌱" : "🫘"}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">
                  {brand === "veggiet" ? "veggiet.official" : "vinkerfoods"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {brand === "veggiet"
                    ? "veggiet 베지어트 | 지속 가능한 먹거리"
                    : "VINKER | Plant-based Protein"}
                </p>
                <div className="flex gap-6 mt-2">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{sortedItems.length}</p>
                    <p className="text-[10px] text-gray-400">게시물</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">
                      {brand === "veggiet" ? "5,168" : "312"}
                    </p>
                    <p className="text-[10px] text-gray-400">팔로워</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">
                      {brand === "veggiet" ? "1,134" : "89"}
                    </p>
                    <p className="text-[10px] text-gray-400">팔로잉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-t border-gray-100">
            <div className="flex-1 py-2.5 flex justify-center border-b-2 border-gray-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div className="flex-1 py-2.5 flex justify-center text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.5 10.5L21 4M21 4h-5.5M21 4v5.5M10 14L3 21m0 0h5m-5 0v-5"/>
              </svg>
            </div>
            <div className="flex-1 py-2.5 flex justify-center text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
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
        </div>

        {editMode && (
          <p className="text-center text-xs text-gray-400 mt-3">
            드래그하여 그리드 순서를 조정할 수 있습니다
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
