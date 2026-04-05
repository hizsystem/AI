"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import { useCalendarData } from "@/hooks/useCalendarData";
import type { ClientConfig } from "@/data/client-config";

interface Props {
  config: ClientConfig;
  readOnly?: boolean;
}

export default function CalendarOnlyClient({ config, readOnly = false }: Props) {
  const CLIENT = config.slug;
  const LOGO = config.logo;

  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(true);

  const fetchMonths = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar-months/${CLIENT}`);
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
  }, [CLIENT, currentMonth]);

  useEffect(() => {
    fetchMonths();
  }, [fetchMonths]);

  const handleAddMonth = async () => {
    const latest = months.length > 0 ? months[months.length - 1] : getCurrentMonth();
    const next = getNextMonth(latest);

    try {
      const res = await fetch(`/api/calendar-months/${CLIENT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: next }),
      });
      if (res.ok) {
        setMonths((prev) => [...prev, next].sort());
        setCurrentMonth(next);
      } else if (res.status === 409) {
        setCurrentMonth(next);
      }
    } catch {
      // ignore
    }
  };

  const { data, loading, error, addItem, updateItem, deleteItem, saveCalendar } =
    useCalendarData(CLIENT, currentMonth);

  if (loadingMonths || (loading && currentMonth)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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

  if (!currentMonth || !data || (error && !data)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">{error || "No calendar data."}</p>
      </div>
    );
  }

  return (
    <Calendar
      data={data}
      allMonths={months}
      onMonthChange={setCurrentMonth}
      editMode={readOnly ? false : editMode}
      onToggleEditMode={readOnly ? undefined : () => setEditMode((prev) => !prev)}
      onAddItem={readOnly ? undefined : addItem}
      onUpdateItem={readOnly ? undefined : updateItem}
      onDeleteItem={readOnly ? undefined : deleteItem}
      onSaveCalendar={readOnly ? undefined : saveCalendar}
      onAddMonth={readOnly ? undefined : handleAddMonth}
      logo={LOGO ?? undefined}
    />
  );
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return `${next.y}-${String(next.m).padStart(2, "0")}`;
}
