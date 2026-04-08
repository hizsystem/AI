import { put, list } from "@vercel/blob";
import type { CalendarData } from "@/data/types";

function blobPath(client: string, month: string): string {
  return `calendar/${client}/${month}.json`;
}

export async function listMonths(client: string): Promise<string[]> {
  const months = new Set<string>();

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `calendar/${client}/`, limit: 100 });
      for (const blob of blobs) {
        const match = blob.pathname.match(/(\d{4}-\d{2})\.json$/);
        if (match) months.add(match[1]);
      }
    } catch (e) {
      console.error("Blob list error:", e);
    }
  }

  return Array.from(months).sort();
}

// In-memory write-through cache to avoid CDN stale reads
const BLOB_CACHE: Record<string, CalendarData> = {};

export async function getCalendar(
  client: string,
  month: string
): Promise<CalendarData | null> {
  const key = `${client}:${month}`;

  if (BLOB_CACHE[key]) {
    return BLOB_CACHE[key];
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN not set");
    return null;
  }

  try {
    const path = blobPath(client, month);
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

  return null;
}

export async function saveCalendar(
  client: string,
  month: string,
  data: CalendarData
): Promise<void> {
  const path = blobPath(client, month);
  const key = `${client}:${month}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    BLOB_CACHE[key] = data;
    return;
  }

  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  BLOB_CACHE[key] = data;
}
