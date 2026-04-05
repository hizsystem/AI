import { put, list } from "@vercel/blob";
import type { ScheduleData } from "@/data/schedule-types";

function blobPath(clientSlug: string): string {
  return `schedule/${clientSlug}.json`;
}

export async function getSchedule(clientSlug: string): Promise<ScheduleData | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: blobPath(clientSlug), limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as ScheduleData;
    }
  } catch (e) {
    console.error("Schedule read error:", e);
  }
  return null;
}

export async function saveSchedule(clientSlug: string, data: ScheduleData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(blobPath(clientSlug), JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
