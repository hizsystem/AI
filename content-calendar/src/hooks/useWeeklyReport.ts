"use client";

import { useState, useEffect, useCallback } from "react";
import type { WeeklyReport, HuenicBrand } from "@/data/huenic-types";

/** Get month-based week: "2026-4월-1w" */
function getCurrentMonthWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const weekOfMonth = Math.ceil(now.getDate() / 7);
  return `${year}-${month}월-${weekOfMonth}w`;
}

/** Shift month-week by delta */
function shiftMonthWeek(current: string, delta: number): string {
  const match = current.match(/^(\d{4})-(\d{1,2})월-(\d)w$/);
  if (!match) return current;
  let year = Number(match[1]);
  let month = Number(match[2]);
  let week = Number(match[3]);

  week += delta;
  if (week < 1) {
    month -= 1;
    if (month < 1) { month = 12; year -= 1; }
    week = 4; // 이전 달 마지막 주
  } else if (week > 4) {
    month += 1;
    if (month > 12) { month = 1; year += 1; }
    week = 1;
  }
  return `${year}-${month}월-${week}w`;
}

interface UseWeeklyReportReturn {
  report: WeeklyReport | null;
  loading: boolean;
  error: string | null;
  week: string; // "YYYY-WNN"
  setWeek: (week: string) => void;
  saveReport: (data: WeeklyReport) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWeeklyReport(brand: HuenicBrand): UseWeeklyReportReturn {
  const defaultWeek = getCurrentMonthWeek();

  const [week, setWeek] = useState(defaultWeek);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/huenic/${brand}/reports/${week}`);
      if (res.status === 404) {
        setReport(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch report");
      const json = await res.json();
      setReport(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [brand, week]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveReport = useCallback(
    async (data: WeeklyReport) => {
      const res = await fetch(`/api/huenic/${brand}/reports/${week}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save report");
      setReport(data);
    },
    [brand, week]
  );

  return { report, loading, error, week, setWeek, saveReport, refetch: fetchData };
}
