import { put, list, del } from "@vercel/blob";
import type { CalendarData } from "@/data/types";

// Static JSON fallback for local dev / initial seed
import march2026 from "@/data/tabshopbar/2026-03.json";
import veggietMarch2026 from "@/data/huenic-seed/veggiet-2026-03.json";
import vinkerMarch2026 from "@/data/huenic-seed/vinker-2026-03.json";

const STATIC_DATA: Record<string, CalendarData> = {
  "tabshopbar:2026-03": march2026 as CalendarData,
  "huenic-veggiet:2026-03": veggietMarch2026 as CalendarData,
  "huenic-vinker:2026-03": vinkerMarch2026 as CalendarData,
};

function blobPath(client: string, month: string): string {
  return `calendar/${client}/${month}.json`;
}

export async function getCalendar(
  client: string,
  month: string
): Promise<CalendarData | null> {
  const path = blobPath(client, month);
  const key = `${client}:${month}`;

  // Try Vercel Blob first
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url);
        if (res.ok) {
          return (await res.json()) as CalendarData;
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // In dev without blob, update in-memory
    STATIC_DATA[`${client}:${month}`] = data;
    return;
  }

  // Delete old blob if exists
  try {
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      await del(blobs[0].url);
    }
  } catch {
    // ignore
  }

  // Write new blob
  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}
