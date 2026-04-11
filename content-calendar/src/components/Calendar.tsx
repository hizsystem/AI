"use client";

import { useState, useMemo, useCallback } from "react";
import type { CalendarData, ContentItem, Category, ContentStatus } from "@/data/types";
import ContentModal from "./ContentModal";
import EditItemModal from "./EditItemModal";
import CategoryLegend from "./CategoryLegend";
import MonthNav from "./MonthNav";
import MoodboardModal from "./MoodboardModal";
import EditMoodboardModal from "./EditMoodboardModal";
import type { MoodboardItem } from "@/data/types";

interface CalendarProps {
  data: CalendarData;
  allMonths: string[];
  onMonthChange: (month: string) => void;
  editMode?: boolean;
  onToggleEditMode?: () => void;
  onAddItem?: (item: ContentItem) => Promise<void>;
  onUpdateItem?: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  onDeleteItem?: (id: string) => Promise<void>;
  onSaveCalendar?: (updates: Partial<CalendarData>) => Promise<void>;
  onAddMonth?: () => void;
  logo?: { src: string; alt: string };
  /** Per-project default hashtags/mentions for new content */
  contentDefaults?: { hashtags?: string[]; mentions?: string[] };
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; text: string }> = {
  planning: { label: "기획", bg: "bg-gray-100", text: "text-gray-500" },
  "needs-confirm": { label: "컨펌 필요", bg: "bg-amber-50", text: "text-amber-600" },
  uploaded: { label: "업로드 완료", bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function Calendar({
  data,
  allMonths,
  onMonthChange,
  editMode = false,
  onToggleEditMode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSaveCalendar,
  onAddMonth,
  logo = { src: '', alt: '' },
  contentDefaults,
}: CalendarProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null | "new">(null);
  const [addDate, setAddDate] = useState<string>("");
  const [showMoodboard, setShowMoodboard] = useState(false);
  const [editMoodboard, setEditMoodboard] = useState(false);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    for (const cat of data.categories) {
      map[cat.id] = cat;
    }
    return map;
  }, [data.categories]);

  const contentCategories = useMemo(
    () => data.categories,
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
    const validCategories = new Set(data.categories.map((c) => c.id));
    const map: Record<number, ContentItem[]> = {};
    for (const item of data.items) {
      if (!validCategories.has(item.category)) continue;
      const day = parseInt(item.date.split("-")[2], 10);
      if (!map[day]) map[day] = [];
      map[day].push(item);
    }
    return map;
  }, [data.items, data.categories]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const monthNames = [
    "", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];

  function dateStr(day: number): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const handleDragStart = useCallback(
    (e: React.DragEvent, itemId: string) => {
      setDragItemId(itemId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", itemId);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, day: number | null) => {
      if (!day || !dragItemId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTargetDay(day);
    },
    [dragItemId]
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetDay(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, day: number | null) => {
      e.preventDefault();
      setDropTargetDay(null);
      if (!day || !dragItemId || !onUpdateItem) return;
      const newDate = dateStr(day);
      setSaving(true);
      try {
        await onUpdateItem(dragItemId, { date: newDate });
      } finally {
        setSaving(false);
        setDragItemId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragItemId, onUpdateItem, year, month]
  );

  const handleSaveItem = useCallback(
    async (item: ContentItem) => {
      setSaving(true);
      setSaveError(null);
      try {
        if (editingItem === "new" && onAddItem) {
          await onAddItem(item);
        } else if (onUpdateItem) {
          await onUpdateItem(item.id, item);
        }
        setEditingItem(null);
      } catch (e) {
        console.error("Save failed:", e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        setSaveError(`저장 실패: ${msg}`);
      } finally {
        setSaving(false);
      }
    },
    [editingItem, onAddItem, onUpdateItem]
  );

  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!onDeleteItem) return;
      setSaving(true);
      try {
        await onDeleteItem(id);
      } finally {
        setSaving(false);
        setEditingItem(null);
      }
    },
    [onDeleteItem]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logo */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-500 mb-2">
                {monthNames[month]} CALENDAR
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {data.title}
              </h1>
            </div>
            {/* Logo */}
            {logo.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logo.src} alt={logo.alt} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex-shrink-0" />
            ) : (
              <span className="h-10 sm:h-12 flex items-center px-2 rounded-lg bg-gray-900 text-white text-[10px] sm:text-xs font-bold tracking-wider flex-shrink-0">
                {logo.alt}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit mode toggle */}
            {onToggleEditMode && (
              <button
                onClick={onToggleEditMode}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
                  editMode
                    ? "border-blue-400 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
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
                <span className="text-xs font-medium">
                  {editMode ? "편집 중" : "편집"}
                </span>
              </button>
            )}
            {/* Moodboard button */}
            {(data.moodboard || editMode) && (
              <button
                onClick={() => editMode ? setEditMoodboard(true) : setShowMoodboard(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
                  editMode
                    ? "border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={editMode ? "text-blue-400" : "text-gray-500"}>
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className={`text-xs font-medium ${editMode ? "text-blue-500" : "text-gray-500"}`}>
                  {editMode ? "무드보드 수정" : "무드보드"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            저장 중...
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 ml-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <div className="min-w-[480px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {DAY_LABELS.map((day, i) => (
              <div
                key={day}
                className={`py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold tracking-wider ${
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
                  className={`min-h-[72px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-2 border-r border-gray-100 last:border-r-0 transition-colors ${
                    day === null
                      ? "bg-gray-50/50"
                      : dropTargetDay === day
                      ? "bg-blue-50 ring-2 ring-inset ring-blue-300"
                      : "bg-white"
                  }`}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  {day !== null && (
                    <>
                      <div className="flex items-center justify-between">
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
                        {editMode && (
                          <button
                            onClick={() => {
                              setAddDate(dateStr(day));
                              setEditingItem("new");
                            }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            title="콘텐츠 추가"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {(itemsByDate[day] || []).map((item) => {
                          const cat = categoryMap[item.category];
                          const status = item.status ? STATUS_CONFIG[item.status] : null;
                          return (
                            <div
                              key={item.id}
                              draggable={editMode}
                              onDragStart={(e) => editMode && handleDragStart(e, item.id)}
                              className={editMode ? "cursor-grab active:cursor-grabbing" : ""}
                            >
                              <button
                                onClick={() => {
                                  if (editMode) {
                                    setEditingItem(item);
                                  } else {
                                    setSelectedItem(item);
                                  }
                                }}
                                className="w-full text-left group cursor-pointer"
                              >
                                {/* Thumbnail */}
                                {item.overview?.images?.[0] && (
                                  <div className="w-full h-12 rounded overflow-hidden mb-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.overview.images[0]}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div
                                  className="px-1.5 py-1 rounded text-xs font-medium truncate transition-all duration-150 group-hover:-translate-y-px group-hover:shadow-sm group-active:translate-y-0 group-active:shadow-none"
                                  style={{
                                    backgroundColor: cat ? `${cat.color}18` : "#f3f4f6",
                                    color: cat?.color || "#6b7280",
                                    borderLeft: `3px solid ${cat?.color || "#d1d5db"}`,
                                  }}
                                >
                                  {editMode && (
                                    <span className="inline-block mr-1 opacity-40">
                                      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                                        <circle cx="2" cy="2" r="1"/><circle cx="6" cy="2" r="1"/>
                                        <circle cx="2" cy="6" r="1"/><circle cx="6" cy="6" r="1"/>
                                      </svg>
                                    </span>
                                  )}
                                  {item.title}
                                </div>
                                {status && (
                                  <span className={`inline-block mt-0.5 px-1.5 py-px rounded text-[9px] font-medium ${status.bg} ${status.text}`}>
                                    {status.label}
                                  </span>
                                )}
                              </button>
                            </div>
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

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-3">
          <MonthNav
            currentMonth={data.month}
            months={allMonths}
            onMonthChange={onMonthChange}
          />
          {editMode && onAddMonth && (
            <button
              onClick={onAddMonth}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + 다음 달
            </button>
          )}
        </div>
      </div>

      {/* View Modal (non-edit mode) */}
      {selectedItem && !editMode && (
        <ContentModal
          item={selectedItem}
          category={categoryMap[selectedItem.category] || { id: "", name: "기타", color: "#888" }}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => {
            setSelectedItem(null);
            setEditingItem(item);
          }}
          logo={logo}
          accountName={logo.alt}
        />
      )}

      {/* Edit Modal */}
      {editingItem !== null && (
        <EditItemModal
          item={editingItem === "new" ? null : editingItem}
          categories={contentCategories}
          defaultDate={editingItem === "new" ? addDate : undefined}
          onSave={handleSaveItem}
          onDelete={editingItem !== "new" ? handleDeleteItem : undefined}
          onClose={() => setEditingItem(null)}
          defaults={contentDefaults}
        />
      )}

      {/* Moodboard Modal */}
      {showMoodboard && data.moodboard && (
        <MoodboardModal
          moodboard={data.moodboard}
          onClose={() => setShowMoodboard(false)}
        />
      )}

      {/* Edit Moodboard Modal */}
      {editMoodboard && editMode && (
        <EditMoodboardModal
          moodboard={data.moodboard ?? { items: [] }}
          clientId={data.clientSlug}
          onSave={async (moodboard) => {
            if (onSaveCalendar) {
              setSaving(true);
              try {
                await onSaveCalendar({ moodboard });
              } finally {
                setSaving(false);
                setEditMoodboard(false);
              }
            }
          }}
          onClose={() => setEditMoodboard(false)}
        />
      )}
    </div>
  );
}
