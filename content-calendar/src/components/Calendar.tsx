"use client";

import { useState, useMemo } from "react";
import type { CalendarData, ContentItem, Category, ContentStatus } from "@/data/types";
import ContentModal from "./ContentModal";
import CategoryLegend from "./CategoryLegend";
import MonthNav from "./MonthNav";
import MoodboardModal from "./MoodboardModal";

interface CalendarProps {
  data: CalendarData;
  allMonths: string[];
  onMonthChange: (month: string) => void;
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CONTENT_CATEGORIES = new Set(["place", "pairing", "scene", "new-menu", "monthly-tap", "collab"]);

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  planning: { label: "기획", bg: "bg-gray-100", text: "text-gray-500" },
  "needs-confirm": { label: "컨펌 필요", bg: "bg-amber-50", text: "text-amber-600" },
  uploaded: { label: "업로드 완료", bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function Calendar({
  data,
  allMonths,
  onMonthChange,
}: CalendarProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showMoodboard, setShowMoodboard] = useState(false);

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    for (const cat of data.categories) {
      map[cat.id] = cat;
    }
    return map;
  }, [data.categories]);

  const contentCategories = useMemo(
    () => data.categories.filter((cat) => CONTENT_CATEGORIES.has(cat.id)),
    [data.categories]
  );

  const { year, month, weeks } = useMemo(() => {
    const [y, m] = data.month.split("-").map(Number);
    const dim = new Date(y, m, 0).getDate();
    const sd = new Date(y, m - 1, 1).getDay();

    const w: (number | null)[][] = [];
    let currentDay = 1;
    const totalCells = Math.ceil((sd + dim) / 7) * 7;
    for (let i = 0; i < totalCells; i += 7) {
      const week: (number | null)[] = [];
      for (let j = 0; j < 7; j++) {
        const cellIndex = i + j;
        if (cellIndex < sd || currentDay > dim) {
          week.push(null);
        } else {
          week.push(currentDay++);
        }
      }
      w.push(week);
    }

    return { year: y, month: m, weeks: w };
  }, [data.month]);

  const itemsByDate = useMemo(() => {
    const map: Record<number, ContentItem[]> = {};
    for (const item of data.items) {
      if (!CONTENT_CATEGORIES.has(item.category)) continue;
      const day = parseInt(item.date.split("-")[2], 10);
      if (!map[day]) map[day] = [];
      map[day].push(item);
    }
    return map;
  }, [data.items]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const monthNames = [
    "", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logo */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-500 mb-2">
              {monthNames[month]} CALENDAR
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {data.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {/* Moodboard button */}
            {data.moodboard && (
              <button
                onClick={() => setShowMoodboard(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="text-xs font-medium text-gray-500">무드보드</span>
              </button>
            )}
            {/* TSB Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tsb-logo.png" alt="TAP SHOP BAR" className="h-12 w-12 rounded-lg" />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {DAY_LABELS.map((day, i) => (
              <div
                key={day}
                className={`py-3 text-center text-xs font-semibold tracking-wider ${
                  i === 0 ? "text-red-400" : "text-gray-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b border-gray-100 last:border-b-0"
            >
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`min-h-[100px] sm:min-h-[120px] p-2 border-r border-gray-100 last:border-r-0 ${
                    day === null ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`text-sm font-medium ${
                          day === todayDate
                            ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white"
                            : di === 0
                            ? "text-red-400"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {(itemsByDate[day] || []).map((item) => {
                          const cat = categoryMap[item.category];
                          const status = item.status ? STATUS_CONFIG[item.status] : null;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className="w-full text-left group"
                            >
                              <div
                                className="px-1.5 py-0.5 rounded text-xs font-medium truncate transition-opacity group-hover:opacity-80"
                                style={{
                                  backgroundColor: cat ? `${cat.color}18` : "#f3f4f6",
                                  color: cat?.color || "#6b7280",
                                  borderLeft: `3px solid ${cat?.color || "#d1d5db"}`,
                                }}
                              >
                                {item.title}
                              </div>
                              {status && (
                                <span className={`inline-block mt-0.5 px-1.5 py-px rounded text-[9px] font-medium ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend - only content categories */}
        <div className="mt-6">
          <CategoryLegend categories={contentCategories} />
        </div>

        {/* Status Legend */}
        <div className="mt-3 flex flex-wrap gap-4 px-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`inline-block px-1.5 py-px rounded text-[9px] font-medium ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>

        {/* Month Navigation - hidden when only 1 month */}
        {allMonths.length > 1 && (
          <MonthNav
            currentMonth={data.month}
            months={allMonths}
            onMonthChange={onMonthChange}
          />
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <ContentModal
          item={selectedItem}
          category={categoryMap[selectedItem.category]}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Moodboard Modal */}
      {showMoodboard && data.moodboard && (
        <MoodboardModal
          moodboard={data.moodboard}
          onClose={() => setShowMoodboard(false)}
        />
      )}
    </div>
  );
}
