import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put, list } from "@vercel/blob";
import type { ArchiveItem } from "@/data/types";

export const dynamic = "force-dynamic";

const BLOB_PATH = "archive/items.json";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("cc-admin-auth")?.value === "authenticated";
}

async function loadArchive(): Promise<ArchiveItem[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url + `?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveArchive(items: ArchiveItem[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(BLOB_PATH, JSON.stringify(items), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// GET — list all archive items
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await loadArchive();
  return NextResponse.json(items);
}

// POST — add a new archive item
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, url, type, clientSlug, category, date, description } = body;
  if (!title || !url || !type || !clientSlug || !category || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const item: ArchiveItem = {
    id: `arc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title, url, type, clientSlug, category, date,
    ...(description && { description }),
  };
  const items = await loadArchive();
  items.unshift(item);
  await saveArchive(items);
  return NextResponse.json(item);
}

// DELETE — remove an archive item by id (passed as query param)
export async function DELETE(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const items = await loadArchive();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveArchive(filtered);
  return NextResponse.json({ success: true });
}
