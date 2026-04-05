"use client";

import { useState, useEffect, useCallback } from "react";
import type { CalendarData, ContentItem } from "@/data/types";

interface UseCalendarDataReturn {
  data: CalendarData | null;
  loading: boolean;
  error: string | null;
  addItem: (item: ContentItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  saveCalendar: (updates: Partial<CalendarData>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCalendarData(
  client: string,
  month: string
): UseCalendarDataReturn {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!client || !month) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar/${client}/${month}`);
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, [client, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = useCallback(
    async (item: ContentItem) => {
      const res = await fetch(`/api/calendar/${client}/${month}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to add item (${res.status})`);
      }
      const newItem = await res.json();
      setData((prev) =>
        prev ? { ...prev, items: [...prev.items, newItem] } : prev
      );
    },
    [client, month]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<ContentItem>) => {
      const res = await fetch(
        `/api/calendar/${client}/${month}/items/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update item (${res.status})`);
      }
      const updated = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === id ? updated : item
              ),
            }
          : prev
      );
    },
    [client, month]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const res = await fetch(
        `/api/calendar/${client}/${month}/items/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete item");
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((item) => item.id !== id) }
          : prev
      );
    },
    [client, month]
  );

  const saveCalendar = useCallback(
    async (updates: Partial<CalendarData>) => {
      if (!data) return;
      const updated = { ...data, ...updates };
      const res = await fetch(`/api/calendar/${client}/${month}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to save calendar");
      setData(updated);
    },
    [client, month, data]
  );

  return { data, loading, error, addItem, updateItem, deleteItem, saveCalendar, refetch: fetchData };
}
