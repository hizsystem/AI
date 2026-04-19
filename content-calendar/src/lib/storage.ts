import { put, list } from "@vercel/blob";
import type { CalendarData } from "@/data/types";
import { getClientConfig } from "@/lib/client-config-storage";

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

// Write-through cache. Only holds snapshots that have been read/written
// through this process. Values are deep-cloned on read to prevent
// external mutation from corrupting cached state when a save fails.
const BLOB_CACHE: Record<string, CalendarData> = {};

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export async function getCalendar(
  client: string,
  month: string
): Promise<CalendarData | null> {
  const key = `${client}:${month}`;

  if (BLOB_CACHE[key]) {
    return clone(BLOB_CACHE[key]);
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
        return clone(data);
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
    BLOB_CACHE[key] = clone(data);
    return;
  }

  await put(path, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  BLOB_CACHE[key] = clone(data);
}

// Build a fresh empty calendar that matches the shape GET returns for an
// uninitialized client/month. Keeps the "no init required" contract in one place.
export async function buildDefaultCalendar(
  client: string,
  month: string
): Promise<CalendarData> {
  const [, mon] = month.split("-");
  const configSlug = client.includes("-") ? client.split("-")[0] : client;
  const config = await getClientConfig(configSlug);
  return {
    client: config?.name ?? client,
    clientSlug: client,
    month,
    title: `${mon}월 콘텐츠 캘린더`,
    description: "",
    categories: config?.defaultCategories ?? [],
    items: [],
  };
}

// Per-key promise chain used as an async mutex to serialize
// read-modify-write within a single process. This does not protect
// against cross-instance races on Vercel, but eliminates the far more
// common same-instance race between concurrent clicks.
const LOCKS: Record<string, Promise<unknown>> = {};

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = LOCKS[key] ?? Promise.resolve();
  // Run fn after prev settles (either fulfilled or rejected — a failed
  // caller must not poison the whole queue for that key).
  const next = prev.then(fn, fn);
  const settled = next.catch(() => undefined);
  LOCKS[key] = settled;
  // Drop the slot when our tail settles, so the map doesn't grow unbounded.
  settled.then(() => {
    if (LOCKS[key] === settled) delete LOCKS[key];
  });
  return next;
}

// Locked read-modify-write. If the calendar does not yet exist and
// `createIfMissing` is true, a default calendar is synthesized — this is
// what unblocks new clients (e.g. 미례국밥) from saving their first item
// without an admin-triggered init.
export async function mutateCalendar(
  client: string,
  month: string,
  mutator: (data: CalendarData) => CalendarData | void,
  opts: { createIfMissing?: boolean } = {}
): Promise<CalendarData | null> {
  const key = `${client}:${month}`;
  return withLock(key, async () => {
    let data = await getCalendar(client, month);
    if (!data) {
      if (!opts.createIfMissing) return null;
      data = await buildDefaultCalendar(client, month);
    }
    const result = mutator(data) ?? data;
    await saveCalendar(client, month, result);
    return result;
  });
}
