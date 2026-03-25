"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import { useCalendarData } from "@/hooks/useCalendarData";
import type { HuenicBrand } from "@/data/huenic-types";

const AVAILABLE_MONTHS = ["2026-03", "2026-04"];

interface CalendarTabProps {
  brand: HuenicBrand;
}

export default function CalendarTab({ brand }: CalendarTabProps) {
  const client = `huenic-${brand}`;
  const [currentMonth, setCurrentMonth] = useState(
    AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1]
  );
  const [editMode, setEditMode] = useState(false);

  const { data, loading, error, addItem, updateItem, deleteItem, saveCalendar } =
    useCalendarData(client, currentMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">캘린더 불러오는 중...</span>
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
    <Calendar
      data={data}
      allMonths={AVAILABLE_MONTHS}
      onMonthChange={setCurrentMonth}
      editMode={editMode}
      onToggleEditMode={() => setEditMode((prev) => !prev)}
      onAddItem={addItem}
      onUpdateItem={updateItem}
      onDeleteItem={deleteItem}
      onSaveCalendar={saveCalendar}
      logo={{ src: "", alt: "HUENIC" }}
    />
  );
}
