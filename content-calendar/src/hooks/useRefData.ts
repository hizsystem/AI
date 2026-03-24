"use client";

import { useState, useEffect, useCallback } from "react";
import type { RefData, RefItem, HuenicBrand } from "@/data/huenic-types";

interface UseRefDataReturn {
  data: RefData | null;
  loading: boolean;
  error: string | null;
  addItem: (item: RefItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRefData(brand: HuenicBrand): UseRefDataReturn {
  const [data, setData] = useState<RefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/huenic/${brand}/refs`);
      if (!res.ok) throw new Error("레퍼런스를 불러올 수 없습니다");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, [brand]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const save = useCallback(
    async (updated: RefData) => {
      setData(updated);
      await fetch(`/api/huenic/${brand}/refs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    },
    [brand]
  );

  const addItem = useCallback(
    async (item: RefItem) => {
      if (!data) return;
      const updated = { ...data, items: [item, ...data.items] };
      await save(updated);
    },
    [data, save]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!data) return;
      const updated = { ...data, items: data.items.filter((i) => i.id !== id) };
      await save(updated);
    },
    [data, save]
  );

  return { data, loading, error, addItem, deleteItem, refetch: fetchData };
}
