import { put, list } from "@vercel/blob";
import type { Playbook } from "@/data/playbook-types";

function blobPath(clientSlug: string, blockType: string): string {
  return `playbook/${clientSlug}/${blockType}.json`;
}

export async function getPlaybook(clientSlug: string, blockType: string): Promise<Playbook | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: blobPath(clientSlug, blockType), limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) return (await res.json()) as Playbook;
    }
  } catch (e) {
    console.error("Playbook read error:", e);
  }
  return null;
}

export async function savePlaybook(clientSlug: string, blockType: string, data: Playbook): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(blobPath(clientSlug, blockType), JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
