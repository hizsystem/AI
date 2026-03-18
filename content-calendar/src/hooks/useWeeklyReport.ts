"use client";

import { useState, useEffect, useCallback } from "react";
import type { WeeklyReport, HuenicBrand } from "@/data/huenic-types";

/** Get ISO week number for a given date */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Get ISO week year (may differ from calendar year at year boundaries) */
function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

/** Format as "YYYY-WNN" */
function formatWeek(year: number, week: number): string {
  return `${year}-W${week}`;
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
  const now = new Date();
  const defaultWeek = formatWeek(getISOWeekYear(now), getISOWeek(now));

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
