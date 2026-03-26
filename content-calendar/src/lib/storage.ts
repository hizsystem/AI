import { put, list } from "@vercel/blob";
import type { CalendarData } from "@/data/types";

// Static JSON fallback for local dev / initial seed
import march2026 from "@/data/tabshopbar/2026-03.json";
import veggietMarch2026 from "@/data/huenic-seed/veggiet-2026-03.json";
import vinkerMarch2026 from "@/data/huenic-seed/vinker-2026-03.json";
import veggietApril2026 from "@/data/huenic-seed/veggiet-2026-04.json";
import vinkerApril2026 from "@/data/huenic-seed/vinker-2026-04.json";

const STATIC_DATA: Record<string, CalendarData> = {
  "tabshopbar:2026-03": march2026 as CalendarData,
  "huenic-veggiet:2026-03": veggietMarch2026 as CalendarData,
  "huenic-vinker:2026-03": vinkerMarch2026 as CalendarData,
  "huenic-veggiet:2026-04": veggietApril2026 as CalendarData,
  "huenic-vinker:2026-04": vinkerApril2026 as CalendarData,
};

function blobPath(client: string, month: string): string {
  return `calendar/${client}/${month}.json`;
}

// In-memory write-through cache to avoid CDN stale reads
const BLOB_CACHE: Record<string, CalendarData> = {};

export async function getCalendar(
  client: string,
  month: string
): Promise<CalendarData | null> {
  const path = blobPath(client, month);
  const key = `${client}:${month}`;

  // Check write-through cache first (same serverless instance)
  if (BLOB_CACHE[key]) {
    return BLOB_CACHE[key];
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("⚠️ BLOB_READ_WRITE_TOKEN 없음 — 데이터가 인메모리에만 저장됩니다. .env.local에 토큰을 추가하세요.");
  }

  // Try Vercel Blob with cache-busting
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const cacheBust = `?t=${Date.now()}`;
        const res = await fetch(blobs[0].url + cacheBust, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as CalendarData;
          BLOB_CACHE[key] = data;
          return data;
        }
      }
    } catch (e) {
      console.error("Blob read error:", e);
    }
  }

  // Fallback to static JSON
  return STATIC_DATA[key] ?? null;
}

export async function saveCalendar(
  client: string,
  month: string,
  data: CalendarData
): Promise<void> {
  const path = blobPath(client, month);
  const key = `${client}:${month}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    STATIC_DATA[key] = data;
    return;
  }

  // Write to blob
  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  // Update write-through cache
  BLOB_CACHE[key] = data;
}
