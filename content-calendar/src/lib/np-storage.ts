import { put, list } from "@vercel/blob";
import type { NpAuditData, NpMissionsData } from "@/data/np-types";

// ─── Audit ───

function auditBlobPath(storeId: string): string {
  return `np/${storeId}/audit.json`;
}

export async function getNpAudit(storeId: string): Promise<NpAuditData | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const path = auditBlobPath(storeId);
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as NpAuditData;
    }
  } catch (e) {
    console.error("NP audit read error:", e);
  }
  return null;
}

export async function saveNpAudit(storeId: string, data: NpAuditData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  await put(auditBlobPath(storeId), JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ─── Missions ───

function missionsBlobPath(storeId: string): string {
  return `np/${storeId}/missions.json`;
}

export async function getNpMissions(storeId: string): Promise<NpMissionsData | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const path = missionsBlobPath(storeId);
    const { blobs } = await list({ prefix: path, limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as NpMissionsData;
    }
  } catch (e) {
    console.error("NP missions read error:", e);
  }
  return null;
}

export async function saveNpMissions(storeId: string, data: NpMissionsData): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  await put(missionsBlobPath(storeId), JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
