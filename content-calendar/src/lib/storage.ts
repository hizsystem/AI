import { put, list } from "@vercel/blob";
import type { CalendarData } from "@/data/types";

// Static JSON — initial seed only, blob takes priority once written
import march2026 from "@/data/tabshopbar/2026-03.json";
import veggietMarch2026 from "@/data/huenic-seed/veggiet-2026-03.json";
import vinkerMarch2026 from "@/data/huenic-seed/vinker-2026-03.json";

const SEED_DATA: Record<string, CalendarData> = {
  "tabshopbar:2026-03": march2026 as CalendarData,
  "huenic-veggiet:2026-03": veggietMarch2026 as CalendarData,
  "huenic-vinker:2026-03": vinkerMarch2026 as CalendarData,
};

function blobPath(client: string, month: string): string {
  return `calendar/${client}/${month}.json`;
}

export async function listMonths(client: string): Promise<string[]> {
  const months = new Set<string>();

  for (const key of Object.keys(SEED_DATA)) {
    if (key.startsWith(`${client}:`)) {
      months.add(key.split(":")[1]);
    }
  }

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

export async function getCalendar(
  client: string,
  month: string
): Promise<CalendarData | null> {
  const path = blobPath(client, month);
  const key = `${client}:${month}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: path, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          return (await res.json()) as CalendarData;
        }
      }
    } catch (e) {
      console.error("Blob read error:", e);
    }
  }

  return SEED_DATA[key] ?? null;
}

export async function saveCalendar(
  client: string,
  month: string,
  data: CalendarData
): Promise<void> {
  const path = blobPath(client, month);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    SEED_DATA[`${client}:${month}`] = data;
    return;
  }

  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
