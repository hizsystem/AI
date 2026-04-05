"use client";

import { useState, useEffect, useCallback } from "react";
import type { KpiData, HuenicBrand } from "@/data/huenic-types";

/** Format as "YYYY-MM" */
function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

interface UseKpiDataReturn {
  kpi: KpiData | null;
  loading: boolean;
  error: string | null;
  month: string; // "YYYY-MM"
  setMonth: (month: string) => void;
  saveKpi: (data: KpiData) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useKpiData(brand: HuenicBrand): UseKpiDataReturn {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/huenic/${brand}/kpi/${month}`);
      if (res.status === 404) {
        setKpi(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch KPI data");
      const json = await res.json();
      setKpi(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [brand, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveKpi = useCallback(
    async (data: KpiData) => {
      const res = await fetch(`/api/huenic/${brand}/kpi/${month}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save KPI data");
      setKpi(data);
    },
    [brand, month]
  );

  return { kpi, loading, error, month, setMonth, saveKpi, refetch: fetchData };
}
