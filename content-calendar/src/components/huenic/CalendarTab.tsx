"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import { useCalendarData } from "@/hooks/useCalendarData";
import type { HuenicBrand } from "@/data/huenic-types";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface CalendarTabProps {
  brand: HuenicBrand;
}

export default function CalendarTab({ brand }: CalendarTabProps) {
  const client = `huenic-${brand}`;
  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(true);

  const fetchMonths = useCallback(async () => {
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
    } finally {
      setLoadingMonths(false);
    }
  }, [client, currentMonth]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  // Reset when brand changes
  useEffect(() => {
    setCurrentMonth("");
    setMonths([]);
    setLoadingMonths(true);
  }, [brand]);

  const { data, loading, error, addItem, updateItem, deleteItem, saveCalendar } =
    useCalendarData(client, currentMonth);

  if (loadingMonths || (loading && currentMonth)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentMonth || error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">{error || "No calendar data."}</p>
      </div>
    );
  }

  return (
    <Calendar
      data={data}
      allMonths={months}
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
