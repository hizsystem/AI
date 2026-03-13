import { put, list, del } from "@vercel/blob";
import type { CalendarData } from "@/data/types";

// Static JSON fallback for local dev / initial seed
import march2026 from "@/data/tabshopbar/2026-03.json";

const STATIC_DATA: Record<string, CalendarData> = {
  "tabshopbar:2026-03": march2026 as CalendarData,
};

export async function listMonths(client: string): Promise<string[]> {
  const months = new Set<string>();

  // Static data keys
  for (const key of Object.keys(STATIC_DATA)) {
    if (key.startsWith(`${client}:`)) {
      months.add(key.split(":")[1]);
    }
  }

  // Blob data
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `calendar/${client}/`, limit: 100 });
      for (const blob of blobs) {
        // path: calendar/tabshopbar/2026-03.json
        const match = blob.pathname.match(/(\d{4}-\d{2})\.json$/);
        if (match) months.add(match[1]);
      }
    } catch (e) {
      console.error("Blob list error:", e);
    }
  }

  return Array.from(months).sort();
}

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
